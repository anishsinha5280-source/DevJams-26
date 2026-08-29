import json
import logging
import os
import re
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, Set

logger = logging.getLogger(__name__)

# Preloaded / Offline cache for well-known CVEs to ensure instant, reliable enrichment
KNOWN_CVE_DATABASE: Dict[str, Dict[str, Any]] = {
    "CVE-2021-44228": {
        "title": "Apache Log4j Remote Code Execution (Log4Shell)",
        "cvss_score": 10.0,
        "epss_score": 0.97,
        "cisa_kev": True,
        "description": "Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints.",
        "remediation_type": "Patch",
        "estimated_hours": 2.5
    },
    "CVE-2024-21413": {
        "title": "Microsoft Outlook Moniker Link Remote Code Execution",
        "cvss_score": 9.8,
        "epss_score": 0.82,
        "cisa_kev": True,
        "description": "Microsoft Outlook Remote Code Execution Vulnerability allowing attackers to bypass Protected View via file:// links.",
        "remediation_type": "Patch",
        "estimated_hours": 1.5
    },
    "CVE-2024-3094": {
        "title": "XZ Utils Liblzma Upstream Supply Chain Backdoor",
        "cvss_score": 10.0,
        "epss_score": 0.95,
        "cisa_kev": True,
        "description": "Malicious code discovered in upstream tarballs of xz-utils liblzma permitting unauthorized SSH authentication bypass.",
        "remediation_type": "Patch",
        "estimated_hours": 3.0
    },
    "CVE-2023-38606": {
        "title": "Apple WebKit / Kernel State Manipulation Vulnerability",
        "cvss_score": 8.2,
        "epss_score": 0.65,
        "cisa_kev": False,
        "description": "An app may be able to modify sensitive kernel state without proper authorization in WebKit rendering engine.",
        "remediation_type": "Configuration",
        "estimated_hours": 1.0
    },
    "CVE-2024-38077": {
        "title": "Windows Remote Desktop Licensing Service RCE",
        "cvss_score": 9.8,
        "epss_score": 0.78,
        "cisa_kev": True,
        "description": "Remote Code Execution vulnerability in Windows Remote Desktop Licensing Service allowing unauthenticated network access.",
        "remediation_type": "Isolation",
        "estimated_hours": 2.0
    },
    "CVE-2024-28987": {
        "title": "SolarWinds Access Rights Manager Hardcoded Secret Flaw",
        "cvss_score": 8.6,
        "epss_score": 0.55,
        "cisa_kev": False,
        "description": "Hardcoded credential and authentication bypass vulnerability in SolarWinds Access Rights Manager (ARM).",
        "remediation_type": "Credential Rotation",
        "estimated_hours": 1.0
    },
    "CVE-2023-34362": {
        "title": "MOVEit Transfer SQL Injection Vulnerability",
        "cvss_score": 9.8,
        "epss_score": 0.96,
        "cisa_kev": True,
        "description": "SQL injection vulnerability in MOVEit Transfer web application that could allow an unauthenticated attacker to gain unauthorized access.",
        "remediation_type": "Patch",
        "estimated_hours": 2.0
    },
    "CVE-2024-1709": {
        "title": "ConnectWise ScreenConnect Authentication Bypass",
        "cvss_score": 10.0,
        "epss_score": 0.94,
        "cisa_kev": True,
        "description": "Authentication bypass using an alternate path or channel in ConnectWise ScreenConnect 23.9.7 and prior.",
        "remediation_type": "Patch",
        "estimated_hours": 1.5
    },
    "CVE-2022-22965": {
        "title": "Spring Framework Remote Code Execution (Spring4Shell)",
        "cvss_score": 9.8,
        "epss_score": 0.89,
        "cisa_kev": True,
        "description": "Spring MVC or Spring WebFlux application running on JDK 9+ vulnerable to RCE via data binding.",
        "remediation_type": "Patch",
        "estimated_hours": 2.0
    },
    "CVE-2017-0144": {
        "title": "Microsoft SMBv1 Remote Code Execution (EternalBlue)",
        "cvss_score": 9.8,
        "epss_score": 0.98,
        "cisa_kev": True,
        "description": "SMBv1 server in Microsoft Windows allows remote attackers to execute arbitrary code via crafted packets.",
        "remediation_type": "Patch",
        "estimated_hours": 2.0
    }
}

# Cache for CISA KEV CVE IDs
_CISA_KEV_CACHE: Optional[Set[str]] = None

def get_cisa_kev_cves() -> Set[str]:
    """Retrieve CISA KEV catalog CVE list with in-memory caching."""
    global _CISA_KEV_CACHE
    if _CISA_KEV_CACHE is not None:
        return _CISA_KEV_CACHE
    
    # Initialize with local known KEV set
    kev_set = {k for k, v in KNOWN_CVE_DATABASE.items() if v.get("cisa_kev")}
    
    try:
        url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
        req = urllib.request.Request(url, headers={"User-Agent": "CybersecurityRiskPrioritizationEngine/1.0"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                for vuln in data.get("vulnerabilities", []):
                    cve = vuln.get("cveID", "").strip().upper()
                    if cve:
                        kev_set.add(cve)
    except Exception as e:
        logger.debug(f"CISA KEV live fetch skipped/failed: {e}")
        
    _CISA_KEV_CACHE = kev_set
    return _CISA_KEV_CACHE

def fetch_epss_score(cve_id: str) -> Optional[float]:
    """Fetch EPSS exploit probability from FIRST EPSS API."""
    try:
        url = f"https://api.first.org/data/v1/epss?cve={cve_id}"
        req = urllib.request.Request(url, headers={"User-Agent": "CybersecurityRiskPrioritizationEngine/1.0"})
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                rows = data.get("data", [])
                if rows:
                    return float(rows[0].get("epss", 0.05))
    except Exception as e:
        logger.debug(f"FIRST EPSS fetch failed for {cve_id}: {e}")
    return None

def fetch_nvd_data(cve_id: str) -> Optional[Dict[str, Any]]:
    """Fetch CVSS score and description from NIST NVD API 2.0."""
    try:
        url = f"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}"
        req = urllib.request.Request(url, headers={"User-Agent": "CybersecurityRiskPrioritizationEngine/1.0"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                vulns = data.get("vulnerabilities", [])
                if vulns:
                    cve_obj = vulns[0].get("cve", {})
                    metrics = cve_obj.get("metrics", {})
                    
                    # Try CVSS v3.1, then v3.0, then v2
                    cvss = None
                    if "cvssMetricV31" in metrics and metrics["cvssMetricV31"]:
                        cvss = float(metrics["cvssMetricV31"][0]["cvssData"]["baseScore"])
                    elif "cvssMetricV30" in metrics and metrics["cvssMetricV30"]:
                        cvss = float(metrics["cvssMetricV30"][0]["cvssData"]["baseScore"])
                    elif "cvssMetricV2" in metrics and metrics["cvssMetricV2"]:
                        cvss = float(metrics["cvssMetricV2"][0]["cvssData"]["baseScore"])
                    
                    # Extract description
                    descriptions = cve_obj.get("descriptions", [])
                    desc_text = ""
                    for d in descriptions:
                        if d.get("lang") == "en":
                            desc_text = d.get("value", "")
                            break
                    if not desc_text and descriptions:
                        desc_text = descriptions[0].get("value", "")
                        
                    return {"cvss_score": cvss, "description": desc_text}
    except Exception as e:
        logger.debug(f"NIST NVD fetch failed for {cve_id}: {e}")
    return None

def derive_severity(cvss: float) -> str:
    if cvss >= 9.0:
        return "Critical"
    elif cvss >= 7.0:
        return "High"
    elif cvss >= 4.0:
        return "Medium"
    return "Low"

def derive_estimated_hours(cvss: float, asset_crit: str) -> float:
    base = 1.0
    if cvss >= 9.0:
        base = 2.5
    elif cvss >= 7.0:
        base = 2.0
    elif cvss >= 4.0:
        base = 1.5
    
    if asset_crit == "Critical":
        base += 0.5
    return round(base, 1)

def enrich_cve(cve_id: str, asset_criticality: str = "Medium") -> Dict[str, Any]:
    """
    Enrich a single CVE using CISA KEV, FIRST EPSS, and NIST NVD APIs,
    with robust fallback to known database and safe defaults.
    """
    cve_clean = cve_id.strip().upper()
    crit_clean = asset_criticality.strip().capitalize()
    if crit_clean not in ["Critical", "High", "Medium", "Low"]:
        crit_clean = "Medium"
        
    known = KNOWN_CVE_DATABASE.get(cve_clean, {})
    
    # 1. CISA KEV Check
    kev_catalog = get_cisa_kev_cves()
    cisa_kev = (cve_clean in kev_catalog) or bool(known.get("cisa_kev", False))
    
    # 2. FIRST EPSS Check
    epss_score = fetch_epss_score(cve_clean)
    if epss_score is None:
        epss_score = float(known.get("epss_score", 0.05))
    epss_score = round(max(0.01, min(1.0, epss_score)), 2)
    
    # 3. NIST NVD Check
    nvd_data = fetch_nvd_data(cve_clean)
    if nvd_data and nvd_data.get("cvss_score") is not None:
        cvss_score = float(nvd_data["cvss_score"])
        description = nvd_data.get("description", "") or known.get("description", f"Vulnerability {cve_clean}")
    else:
        cvss_score = float(known.get("cvss_score", 7.5))
        description = known.get("description", f"Vulnerability {cve_clean} in system components.")
        
    cvss_score = round(max(0.0, min(10.0, cvss_score)), 1)
    severity = derive_severity(cvss_score)
    title = known.get("title", f"{cve_clean} - Security Vulnerability")
    estimated_hours = float(known.get("estimated_hours") or derive_estimated_hours(cvss_score, crit_clean))
    remediation_type = known.get("remediation_type", "Patch")
    asset_name = f"Asset-{cve_clean.replace('CVE-', '')} ({crit_clean})"
    remediation_steps = f"Apply latest vendor security patch for {cve_clean} and verify system integrity."
    
    return {
        "vulnerability_id": cve_clean,
        "title": title,
        "severity": severity,
        "cvss_score": cvss_score,
        "epss_score": epss_score,
        "cisa_kev": cisa_kev,
        "asset_name": asset_name,
        "asset_criticality": crit_clean,
        "remediation_type": remediation_type,
        "estimated_hours": estimated_hours,
        "actual_hours": 0.0,
        "status": "pending",
        "description": description,
        "remediation_steps": remediation_steps
    }
