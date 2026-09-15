import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
export function NotFound() {
  return (
    <div className="page-shell not-found">
      <span className="error-code" aria-hidden="true">
        404
      </span>
      <span className="eyebrow">OFF THE BEATEN TRACK</span>
      <h1 tabIndex={-1}>This track went quiet.</h1>
      <p className="lead">
        We can’t find that page.
        <br />
        There’s still plenty of music to discover.
      </p>
      <div className="state-actions">
        <Link to="/" className="button primary">
          Back to Discover
          <ArrowRight size={18} />
        </Link>
        <Link to="/liked" className="text-button">
          <ArrowLeft size={16} />
          Your liked songs
        </Link>
      </div>
    </div>
  );
}
export default NotFound;
