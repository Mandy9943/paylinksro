# Fee logic overview

Constants live in `src/config/fees.ts` and control:
- MIN_TRANSACTION_RON
- PERCENT_FEE
- FIXED_FEE_LOW_RON, FIXED_FEE_HIGH_RON, FIXED_FEE_THRESHOLD_RON
- MONTHLY_ACTIVE_FEE_RON

Helpers:
- BANI.fromRON / BANI.toRON
- calcBaseApplicationFeeMinor(amountMinor)
- splitBaseApplicationFeeMinor(amountMinor)
- monthStartUTC(), minTransactionMinor(), monthlyFeeMinor()

Runtime flow:
- Creating/updating pay links: server validates minimums; web form mirrors this.
- Public payment intent: computes application_fee_amount as base (5% + fixed) + monthly fee portion still due, capped by tx amount. Metadata encodes `appFeeBase` and `appFeeMonthly` for reconciliation.
- On `charge.succeeded`: stores fee breakdown on Transaction and upserts MonthlyFeeAccrual for the seller/month with the monthly portion collected (charged only once per month across transactions).

To change fees, edit `src/config/fees.ts` and redeploy.