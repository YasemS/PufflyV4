import type { Route } from "./+types/legal.privacy";

export const meta: Route.MetaFunction = () => {
  return [{ title: `privacy policy - puffly` }];
};

export default function LegalPrivacy() {
  return (
    <div className="legal">
      <h1>Privacy Policy</h1>

      <p>Last updated: 1 June 2025</p>

      <p>
        Welcome to <strong>Puffly</strong>. Your privacy is important to us. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you visit our website{" "}
        <a href="https://www.puffly.io">https://www.puffly.io</a> (the “Site”).
      </p>

      <h2>1. Information We Collect</h2>

      <h3>a. Personal Information</h3>
      <p>When you make a purchase or create an account, we may collect:</p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Billing and shipping address</li>
        <li>Date of birth (for age verification)</li>
        <li>Payment details (processed securely by third-party providers)</li>
      </ul>

      <h3>b. Automatically Collected Information</h3>
      <p>We may collect data automatically when you access the Site, such as:</p>
      <ul>
        <li>IP address</li>
        <li>Browser type</li>
        <li>Device type</li>
        <li>Pages visited</li>
        <li>Time spent on the Site</li>
      </ul>

      <h3>c. Cookies and Tracking Technologies</h3>
      <p>
        We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content and
        ads. You can adjust cookie settings through your browser.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and deliver your orders</li>
        <li>Verify your age and identity</li>
        <li>Communicate with you about orders or promotions</li>
        <li>Improve our website and customer experience</li>
        <li>Send marketing and promotional emails (you may opt out at any time)</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Sharing Your Information</h2>
      <p>We do not sell your personal data. However, we may share your information with:</p>
      <ul>
        <li>Payment processors</li>
        <li>Shipping providers</li>
        <li>Marketing platforms (e.g. email services)</li>
        <li>Legal authorities when required</li>
      </ul>
      <p>All third-party providers are required to protect your data in compliance with this policy.</p>

      <h2>4. Age Restriction</h2>
      <p>
        Puffly is intended for adults aged 21 and over. We do not knowingly collect data from individuals under 21. If
        we learn that we have collected personal information from a minor, we will delete it immediately.
      </p>

      <h2>5. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li>Access, correct, or delete your personal data</li>
        <li>Object to or restrict certain data processing</li>
        <li>Withdraw consent for marketing communications</li>
        <li>File a complaint with a data protection authority</li>
      </ul>
      <p>
        To exercise your rights, contact us at <a href="mailto:support@puffly.io">support@puffly.com</a>.
      </p>

      <h2>6. Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your information. However, no transmission over the
        internet is 100% secure.
      </p>

      <h2>7. Third-Party Links</h2>
      <p>
        Our website may contain links to third-party websites. We are not responsible for their privacy practices.
        Please review their policies before submitting any personal data.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised
        &quot;Last Updated&quot; date. Continued use of the Site after changes implies your acceptance.
      </p>

      <h2>9. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us:</p>
      <ul>
        <li>
          Email: <a href="mailto:support@puffly.io">support@puffly.com</a>
        </li>
        <li>Live Chat: Available during business hours on our website</li>
      </ul>
    </div>
  );
}
