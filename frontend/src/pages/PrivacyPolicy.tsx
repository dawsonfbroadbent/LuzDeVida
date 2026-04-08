export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy">
      <div className="container">
        <header className="privacy-policy__header">
          <p className="privacy-policy__eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="privacy-policy__meta">
            Last updated: <time dateTime="2026-04-07">April 7, 2026</time>
          </p>
        </header>

        <div className="privacy-policy__body">

          <section>
            <h2>Who we are</h2>
            <p>
              Luz De Vida is a nonprofit organization based in Costa Rica. This Site
              exists to share our mission, accept charitable donations, and manage
              supporter accounts.
            </p>
            <p>
              For the purposes of the EU General Data Protection Regulation (GDPR),
              Luz De Vida is the <strong>data controller</strong> responsible for your
              personal data collected through this Site.
            </p>
            <p>
              Questions or requests about this policy can be sent to:{' '}
              <a href="mailto:info@luzdevida.org">info@luzdevida.org</a>
            </p>
          </section>

          <section>
            <h2>What data we collect and why</h2>
            <p>
              We collect only the data necessary to operate the Site and fulfill our
              nonprofit mission. The table below describes each category.
            </p>

            <div className="privacy-policy__table-wrap">
              <table className="privacy-policy__table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Data collected</th>
                    <th>Purpose</th>
                    <th>Legal basis (GDPR Art. 6)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Donor information</td>
                    <td>Full name, email address, donation amount and frequency</td>
                    <td>Record charitable gifts and maintain accurate donor records</td>
                    <td>Legitimate interests; legal obligation (financial record-keeping)</td>
                  </tr>
                  <tr>
                    <td>Supporter accounts</td>
                    <td>Full name, email address, hashed password, account creation date</td>
                    <td>Provide a secure login to track giving history and manage preferences</td>
                    <td>Performance of a contract (account agreement)</td>
                  </tr>
                  <tr>
                    <td>Communications</td>
                    <td>Email address, message content when you contact us</td>
                    <td>Respond to enquiries and provide support</td>
                    <td>Legitimate interests</td>
                  </tr>
                  <tr>
                    <td>Technical / usage data</td>
                    <td>IP address, browser type, pages visited, referral source (collected by server logs or analytics)</td>
                    <td>Maintain Site security and understand how visitors use the Site</td>
                    <td>Legitimate interests</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>How we use your data</h2>
            <p>We use the data listed above to:</p>
            <ul>
              <li>Record and acknowledge your donations;</li>
              <li>Create and maintain your supporter account;</li>
              <li>Send you updates about our work, where you have opted in;</li>
              <li>Comply with legal and accounting obligations;</li>
              <li>Protect the security and integrity of the Site.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal data to third
              parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              The Site uses only cookies that are strictly necessary for it to function
              (for example, session and authentication tokens stored in your browser's
              local storage). We do not use advertising, tracking, or profiling cookies.
            </p>
            <p>
              You can clear these tokens at any time through your browser settings; doing
              so will sign you out of your account.
            </p>
          </section>

          <section>
            <h2>Who we share your data with</h2>
            <p>
              We share personal data only with the following categories of third parties,
              and only to the extent necessary:
            </p>
            <ul>
              <li>
                <strong>Hosting and infrastructure providers</strong> — our web hosting
                and database services process data on our behalf under data-processing
                agreements.
              </li>
              <li>
                <strong>Legal or regulatory authorities</strong> — where we are required
                to do so by applicable law or court order.
              </li>
            </ul>
          </section>

          <section>
            <h2>International transfers</h2>
            <p>
              Luz De Vida operates from Costa Rica. If you are accessing the Site from
              the European Economic Area (EEA) or the United Kingdom, your data may be
              transferred to and processed in countries outside the EEA. Where such
              transfers occur, we rely on appropriate safeguards (such as Standard
              Contractual Clauses) to protect your data in accordance with GDPR
              requirements.
            </p>
          </section>

          <section>
            <h2>How long we keep your data</h2>
            <p>We retain personal data only as long as necessary:</p>
            <ul>
              <li>
                <strong>Supporter accounts</strong> — for as long as the account is
                active, plus 30 days after deletion to allow recovery, then permanently
                erased.
              </li>
              <li>
                <strong>Support communications</strong> — up to 2 years from the date of
                last contact, unless a longer period is required by law.
              </li>
              <li>
                <strong>Server logs</strong> — up to 90 days.
              </li>
            </ul>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>
              If you are in the EEA or UK, GDPR gives you the following rights over your
              personal data. You can exercise any of these by emailing{' '}
              <a href="mailto:info@luzdevida.org">info@luzdevida.org</a>.
            </p>
            <ul>
              <li>
                <strong>Access</strong> — request a copy of the personal data we hold
                about you.
              </li>
              <li>
                <strong>Rectification</strong> — ask us to correct inaccurate or
                incomplete data.
              </li>
              <li>
                <strong>Erasure ("right to be forgotten")</strong> — ask us to delete
                your data, subject to legal retention obligations.
              </li>
              <li>
                <strong>Restriction</strong> — ask us to limit how we process your data
                in certain circumstances.
              </li>
              <li>
                <strong>Portability</strong> — receive a copy of your data in a
                structured, machine-readable format.
              </li>
              <li>
                <strong>Objection</strong> — object to processing based on legitimate
                interests.
              </li>
              <li>
                <strong>Withdraw consent</strong> — where processing is based on
                consent, withdraw it at any time without affecting prior processing.
              </li>
            </ul>
            <p>
              We will respond to all requests within 30 days. If you believe we have not
              handled your data correctly, you have the right to lodge a complaint with
              your local data protection authority.
            </p>
          </section>

          <section>
            <h2>Children's privacy</h2>
            <p>
              The Site is not directed at children under the age of 16. We do not
              knowingly collect personal data from children. If you believe a child has
              provided us with their data, please contact us at{' '}
              <a href="mailto:info@luzdevida.org">info@luzdevida.org</a> and we will
              delete it promptly.
            </p>
          </section>

          <section>
            <h2>Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will
              revise the "Last updated" date at the top of this page. Material changes
              will be communicated to registered supporters by email. Continued use of
              the Site after any changes constitutes your acceptance of the revised
              policy.
            </p>
          </section>

          <section>
            <h2>Contact us</h2>
            <p>
              For any privacy-related questions, data requests, or concerns, please
              contact us at:
            </p>
            <address>
              Luz De Vida<br />
              Costa Rica<br />
              <a href="mailto:info@luzdevida.org">info@luzdevida.org</a>
            </address>
          </section>

        </div>
      </div>
    </div>
  )
}
