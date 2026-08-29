import io
import pandas as pd
from typing import List, Tuple, Dict, Any

REQUIRED_COLUMNS = ['title', 'cvss_score', 'asset_name', 'estimated_hours']

SAMPLE_CSV_TEMPLATE = """vulnerability_id,title,severity,cvss_score,epss_score,cisa_kev,asset_name,asset_criticality,remediation_type,estimated_hours,description,remediation_steps
CVE-2024-3094,XZ Utils Liblzma Backdoor,Critical,10.0,0.95,true,SSH Gateway Prod,Critical,Patch,6.0,Malicious code discovered in upstream tarballs of xz-utils.,Downgrade xz-utils package to 5.4.6 and restart sshd services.
CVE-2024-21413,Microsoft Outlook Moniker Link RCE,High,8.8,0.82,true,Executive Workstations,High,Patch,1.5,CVSS 8.8 Remote Code Execution vulnerability in Outlook.,Deploy Microsoft KB5034763 patch across all Windows fleet.
CVE-2023-38606,WebKit Kernel State Manipulation,High,8.2,0.65,false,Customer Portal API,High,Configuration,1.0,WebKit flaw permitting arbitrary kernel memory manipulation.,Update Safari/WebKit rendering framework and restart proxy.
CVE-2024-38077,Windows Remote Desktop Licensing RCE,Critical,9.8,0.78,true,Internal Jump Host,Critical,Isolation,2.0,Critical RCE vulnerability in Remote Desktop Licensing service.,Disable Remote Desktop Licensing Service or isolate on private subnet.
CVE-2024-28987,SolarWinds ARM Hardcoded Credential,High,8.6,0.55,false,Network Monitoring Server,Medium,Credential Rotation,1.0,Hardcoded credential vulnerability in Access Rights Manager.,Rotate admin secret keys and apply vendor hotfix HF-03.
"""

def parse_and_validate_csv(csv_content: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    errors = []
    valid_records = []
    
    try:
        df = pd.read_csv(io.StringIO(csv_content))
    except Exception as e:
        return [], [f"Failed to parse CSV format: {str(e)}"]
        
    if df.empty:
        return [], ["CSV file is empty."]
        
    df.columns = [c.strip().lower() for c in df.columns]
    
    missing_required = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_required:
        return [], [f"Missing mandatory CSV columns: {', '.join(missing_required)}. Required: {', '.join(REQUIRED_COLUMNS)}"]
        
    for index, row in df.iterrows():
        row_num = index + 2
        row_dict = row.to_dict()
        
        try:
            title = str(row_dict.get('title', '')).strip()
            if not title or title.lower() == 'nan':
                errors.append(f"Row {row_num}: 'title' is empty.")
                continue
                
            vuln_id = str(row_dict.get('vulnerability_id', '')).strip()
            if not vuln_id or vuln_id.lower() == 'nan':
                vuln_id = f"VULN-CSV-{row_num:03d}"
                
            try:
                cvss = float(row_dict.get('cvss_score', 5.0))
                if not (0.0 <= cvss <= 10.0):
                    errors.append(f"Row {row_num}: cvss_score ({cvss}) must be between 0.0 and 10.0.")
                    continue
            except (ValueError, TypeError):
                errors.append(f"Row {row_num}: invalid numeric cvss_score '{row_dict.get('cvss_score')}'.")
                continue
                
            try:
                epss_raw = row_dict.get('epss_score', 0.05)
                epss = float(0.05 if pd.isna(epss_raw) else epss_raw)
                epss = max(0.0, min(1.0, epss))
            except (ValueError, TypeError):
                epss = 0.05
                
            cisa_raw = str(row_dict.get('cisa_kev', 'false')).strip().lower()
            cisa_kev = cisa_raw in ['true', '1', 'yes', 't', 'y']
            
            asset_name = str(row_dict.get('asset_name', 'General Infrastructure')).strip()
            if not asset_name or asset_name.lower() == 'nan':
                asset_name = 'Default Asset'
                
            crit_raw = str(row_dict.get('asset_criticality', 'Medium')).strip().capitalize()
            if crit_raw not in ['Critical', 'High', 'Medium', 'Low']:
                crit_raw = 'Medium'
                
            sev_raw = str(row_dict.get('severity', '')).strip().capitalize()
            if sev_raw not in ['Critical', 'High', 'Medium', 'Low']:
                if cvss >= 9.0:
                    sev_raw = 'Critical'
                elif cvss >= 7.0:
                    sev_raw = 'High'
                elif cvss >= 4.0:
                    sev_raw = 'Medium'
                else:
                    sev_raw = 'Low'
                    
            rem_type = str(row_dict.get('remediation_type', 'Patch')).strip().title()
            if not rem_type or rem_type.lower() == 'nan':
                rem_type = 'Patch'
                
            try:
                hours = float(row_dict.get('estimated_hours', 1.0))
                if hours <= 0:
                    errors.append(f"Row {row_num}: estimated_hours must be > 0 (got {hours}).")
                    continue
            except (ValueError, TypeError):
                errors.append(f"Row {row_num}: invalid estimated_hours '{row_dict.get('estimated_hours')}'.")
                continue
                
            desc = str(row_dict.get('description', '')).strip()
            if desc.lower() == 'nan':
                desc = ''
                
            steps = str(row_dict.get('remediation_steps', '')).strip()
            if steps.lower() == 'nan':
                steps = ''
                
            record = {
                'vulnerability_id': vuln_id,
                'title': title,
                'severity': sev_raw,
                'cvss_score': round(cvss, 1),
                'epss_score': round(epss, 3),
                'cisa_kev': 1 if cisa_kev else 0,
                'asset_name': asset_name,
                'asset_criticality': crit_raw,
                'remediation_type': rem_type,
                'estimated_hours': round(hours, 2),
                'actual_hours': 0.0,
                'status': 'pending',
                'description': desc,
                'remediation_steps': steps
            }
            valid_records.append(record)
            
        except Exception as e:
            errors.append(f"Row {row_num}: Unexpected parsing error: {str(e)}")
            
    return valid_records, errors
