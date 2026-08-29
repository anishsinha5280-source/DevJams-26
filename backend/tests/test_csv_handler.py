from app.services.csv_handler import parse_and_validate_csv, SAMPLE_CSV_TEMPLATE

def test_csv_template_parses_successfully():
    records, errors = parse_and_validate_csv(SAMPLE_CSV_TEMPLATE)
    assert len(records) == 5
    assert len(errors) == 0
    assert records[0]["vulnerability_id"] == "CVE-2024-3094"
    assert records[0]["cisa_kev"] == 1
    assert records[0]["estimated_hours"] == 6.0

def test_csv_validation_missing_columns():
    bad_csv = "title,severity\nBug 1,High"
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
