import { Ic } from "../../data/homeData";

const Toast = ({ message }) => (
  <div className="toast">
    {Ic.check}
    {message}
  </div>
);

export default Toast;