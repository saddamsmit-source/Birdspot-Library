"""Compare the historical first-pass ledger with the current canonical audit."""


def historical_audit_status(rows, ledger):
    species_ids = {row["id"] for row in rows}
    current_audited = {row["id"] for row in rows if row["audited"]}
    first_pass_ids = {row["id"] for row in ledger["additionalFirstPass"]}
    assert len(species_ids) == len(rows) == ledger["_meta"]["target"] == 140
    assert first_pass_ids <= species_ids

    # A document reviewed in F1 retains that record after it receives an audit in F2.
    baseline_audited = current_audited - first_pass_ids
    baseline_pending = species_ids - baseline_audited
    assert len(baseline_audited) == ledger["_meta"]["baselineAudited"] == 100
    assert len(baseline_pending) == ledger["_meta"]["expectedCanonicalUnreviewed"] == 40
    current_coverage = current_audited | first_pass_ids
    assert len(current_coverage) == ledger["_meta"]["expectedFirstPass"]
    assert len(species_ids - current_coverage) == ledger["_meta"]["expectedRemaining"]
    return baseline_audited, baseline_pending
