import { Ic } from "../../data/adminData";

function ComingSoon({ label }) {
  return (
    <div className="coming-soon">
      <div className="cs-icon">{Ic.warning}</div>
      <div className="cs-title">{label}</div>
      <div className="cs-sub">Este modulo estara disponible pronto.</div>
    </div>
  );
}

export default ComingSoon;