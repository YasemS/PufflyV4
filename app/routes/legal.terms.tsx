import type { Route } from "./+types/legal.terms";

export const meta: Route.MetaFunction = () => {
  return [{ title: `terms of service - puffly` }];
};

export default function LegalTerms() {
  return (
    <div className="legal">
      <h1>Terms of Service</h1>

      <p>Last updated: 1 June 2025</p>

      <p>
        Welcome to <strong>Puffly</strong> (the &quot;Site&quot;). These Terms of Service (&quot;Terms&quot;) govern
        your use of our website located at <a href="https://www.puffly.io">https://www.puffly.io</a> and any services or
        products offered through the Site.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Site, you agree to be bound by these Terms. If you do not agree to these Terms, do not
        use the Site.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 21 years old to purchase or use products from Puffly. By using this Site, you confirm that
        you meet this age requirement.
      </p>

      <h2>3. Products and Orders</h2>
      <p>
        All orders are subject to availability and our acceptance. We reserve the right to refuse or cancel any order at
        our discretion. Prices are subject to change without notice.
      </p>

      <h2>4. Refunds and Returns</h2>
      <p>
        Please refer to our <a href="/legal/refund">Refund Policy</a> for information about returns and refunds. We only
        accept returns for unopened products within 14 days of delivery.
      </p>

      <h2>5. User Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Site for any unlawful purpose</li>
        <li>Violate any local, national, or international laws or regulations</li>
        <li>Interfere with or disrupt the Site&apos;s operation</li>
        <li>Attempt to gain unauthorized access to any part of the Site</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        All content on the Site, including text, graphics, logos, and product images, is the property of Puffly or its
        licensors and is protected by intellectual property laws. You may not use any content without our express
        written permission.
      </p>

      <h2>7. Disclaimer of Warranties</h2>
      <p>
        The Site and all products are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
        kind. We make no warranties, express or implied, regarding the Site&apos;s operation or the accuracy of any
        information.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Puffly shall not be liable for any direct, indirect, incidental, or
        consequential damages resulting from your use of the Site or any product purchased through it.
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Puffly and its affiliates from any claims, liabilities, damages, and
        expenses arising out of your use of the Site or your violation of these Terms.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the United States of America. Any
        disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in the
        United States of America.
      </p>

      <h2>11. Changes to Terms</h2>
      <p>
        We reserve the right to update or modify these Terms at any time. Changes will be posted on this page with an
        updated &quot;Effective Date.&quot; Continued use of the Site after changes implies your acceptance.
      </p>

      <h2>12. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us:</p>

      <ul>
        <li>
          Email: <a href="mailto:support@puffly.io">support@puffly.com</a>
        </li>
        <li>Live Chat: Available during business hours on our website</li>
      </ul>
    </div>
  );
}
