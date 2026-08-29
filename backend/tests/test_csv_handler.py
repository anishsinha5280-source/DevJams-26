from app.services.csv_handler import parse_and_validate_csv, SAMPLE_CSV_TEMPLATE

def test_simplified_csv_template_parses_and_enriches():
    records, errors = parse_and_validate_csv(SAMPLE_CSV_TEMPLATE)
    assert len(records) == 5
    assert len(errors) == 0
    
    # Check that CVE-2021-44228 is enriched with Log4Shell details
    log4j = next(r for r in records if r["vulnerability_id"] == "CVE-2021-44228")
    assert log4j["cvss_score"] == 10.0
    assert log4j["epss_score"] >= 0.90
    assert log4j["cisa_kev"] == 1 or log4j["cisa_kev"] is True
    assert log4j["asset_criticality"] == "Critical"
    assert "Log4j" in log4j["title"] or "Log4Shell" in log4j["title"]

def test_legacy_full_csv_parses():
    legacy_csv = """vulnerability_id,title,cvss_score,asset_name,estimated_hours
V1,Valid Row,8.5,Server 1,2.0
"""
    records, errors = parse_and_validate_csv(legacy_csv)
    assert len(records) == 1
    assert records[0]["vulnerability_id"] == "V1"
    assert records[0]["cvss_score"] == 8.5
    assert records[0]["estimated_hours"] == 2.0

def test_csv_validation_missing_columns():
    bad_csv = "other_field_1,other_field_2\nValue1,Value2"
    records, errors = parse_and_validate_csv(bad_csv)
    assert len(records) == 0
    assert any("Missing mandatory CSV columns" in e for e in errors)

def test_csv_validation_invalid_rows():
    malformed_csv = """vulnerability_id,title,cvss_score,asset_name,estimated_hours
V1,Valid Row,8.5,Server 1,2.0
V2,,9.0,Server 2,1.0
V3,Invalid CVSS,15.0,Server 3,1.0
V4,Negative Hours,7.0,Server 4,-2.0
"""
    records, errors = parse_and_validate_csv(malformed_csv)
    assert len(records) == 1
    assert records[0]["vulnerability_id"] == "V1"
    assert len(errors) == 3
