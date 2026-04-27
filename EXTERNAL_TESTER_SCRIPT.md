# External Tester Script

Use this script for private testers before broader launch. Record tester name, organization, browser, date/time, and any screenshots or errors.

## 1. Public evaluation

- [ ] Open `/` and confirm the product promise is understandable.
- [ ] Open `/pricing` and confirm plan options, CAD pricing, billing notes, and cancellation/support expectations are clear.
- [ ] Open `/security`, `/privacy`, `/terms`, and `/contact`.
- [ ] Confirm the tester can identify how to contact support for billing, activation, or security issues.

## 2. Signup and activation

- [ ] Start signup from `/signup` or a pricing CTA.
- [ ] Create an account with a work email and 12+ character password.
- [ ] If email confirmation is required, confirm the login page explains the next step.
- [ ] Complete Stripe checkout for the selected plan.
- [ ] Confirm the app redirects into the workspace after billing activates.
- [ ] If the activation gate appears, use “Recheck billing”.
- [ ] If billing is still incomplete, use “Resume checkout” and confirm it does not create a duplicate organization.

## 3. Dashboard first-use flow

- [ ] Confirm the dashboard displays the tester’s organization name, not demo data.
- [ ] Review the first-steps checklist.
- [ ] Confirm KPI counts make sense for a new workspace.
- [ ] Confirm control cards show status, owner, and evidence count.

## 4. Control update loop

- [ ] Open `/controls`.
- [ ] Pick one control.
- [ ] Change its status to in progress.
- [ ] Add or update implementation notes.
- [ ] Enter an owner.
- [ ] Save changes.
- [ ] Return to dashboard and confirm the update appears.

## 5. Evidence register loop

- [ ] Open `/evidence`.
- [ ] Confirm the page clearly describes itself as an evidence register, not a file vault.
- [ ] Add an evidence record for the updated control.
- [ ] Include evidence title, type, and source location/reference.
- [ ] Confirm the record appears in recent evidence and evidence-by-control sections.

## 6. Reporting loop

- [ ] Open `/reports`.
- [ ] Confirm the page uses readiness-report language and does not imply certification guarantee.
- [ ] Download the readiness PDF.
- [ ] Confirm the PDF includes the updated control and evidence reference.

## 7. Support path

- [ ] Open `/contact`.
- [ ] Confirm product support, billing support, and security contact paths are understandable.
- [ ] Send or simulate a support request with organization name and account email.

## Pass/fail criteria for private launch

Private testers should not encounter:

- duplicate organization creation during activation recovery
- demo customer names in the app shell
- unexplained email-confirmation/login failures
- checkout loops with no resume path
- “vault” language suggesting file upload where only metadata is stored
- report language implying certification or external acceptance guarantee
- missing support path for billing or activation problems
