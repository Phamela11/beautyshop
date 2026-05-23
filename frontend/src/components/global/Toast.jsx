import { Ic } from "../../data/catalogoData";

const Toast = ({ message }) => (
  <div className="toast">
    {Ic.check}
    {message}
  </div>
);

export default Toast;