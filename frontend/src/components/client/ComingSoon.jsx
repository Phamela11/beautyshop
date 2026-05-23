import { Icons } from "../../data/clientData";

const ComingSoon = ({ label }) => (
  <div className="empty-state">
    <div className="empty-icon">{Icons.box}</div>
    <p>La seccion <strong>{label}</strong> estara disponible pronto.</p>
  </div>
);

export default ComingSoon;