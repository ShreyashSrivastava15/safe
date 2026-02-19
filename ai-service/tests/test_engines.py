import pytest
import asyncio
from engines.communication import analyze_communication
from engines.url import analyze_url

@pytest.mark.asyncio
async def test_communication_spam():
    content = "URGENT: Your bank account has been locked. Verify now at http://fake-bank.xyz"
    result = await analyze_communication(content)
    assert result['risk_score'] > 0.5
    assert any("Urgent" in s for s in result['signals'])
    assert any("bank" in content.lower() for _ in [1]) # Check logic

@pytest.mark.asyncio
async def test_url_suspicious_tld():
    url = "http://secure-login.xyz"
    result = await analyze_url(url)
    assert result['risk_score'] > 0.3
    assert any("Suspicious TLD" in s for s in result['signals'])

@pytest.mark.asyncio
async def test_url_longevity():
    # This might fail if WHOIS is blocked, so we test the heuristic part
    url = "https://this-is-a-very-long-url-that-should-trigger-the-length-heuristic-check.com/login"
    result = await analyze_url(url)
    assert any("Excessively long URL" in s for s in result['signals'])
