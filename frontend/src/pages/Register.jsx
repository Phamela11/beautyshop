import { useState } from "react";
import { useNavigate } from "react-router-dom";
import shopImage from "../assets/shop.jpg";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root { height: 100%; overflow: hidden; }
  body { font-family: 'DM Sans', sans-serif; background: #fff; }

  .split-root {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .split-image {
    flex: 1;
    overflow: hidden;
  }
  .split-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 40%;
    display: block;
  }

  .split-form {
    flex: 1;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 40px;
    overflow-y: auto;
  }

  .form-inner {
    width: 100%;
    max-width: 360px;
  }

  .brand {
    text-align: center;
    margin-bottom: 22px;
  }
  .brand-icon { font-size: 24px; display: block; margin-bottom: 4px; }
  .brand-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: #1a1015;
  }
  .brand-name span { color: #c9536a; font-style: italic; }
  .brand-tagline {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #b09aa0;
    margin-top: 2px;
  }

  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 400;
    color: #1a1015;
    margin-bottom: 18px;
    letter-spacing: 0.05em;
    text-align: center;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .field { margin-bottom: 12px; }
  .field label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #9c7a85;
    margin-bottom: 5px;
  }
  .field input {
    width: 100%;
    background: #faf7f8;
    border: 1.5px solid #e8dde0;
    border-radius: 8px;
    padding: 10px 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #1a1015;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field input:focus {
    border-color: #c9536a;
    box-shadow: 0 0 0 3px rgba(201,83,106,0.1);
    background: #fff;
  }
  .field input::placeholder { color: #c4adb4; }
  .field input.error-input {
    border-color: #c0606a;
    background: #fff8f8;
    box-shadow: 0 0 0 3px rgba(192,96,106,0.09);
  }

  .field-error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: #b85560;
    margin-top: 4px;
  }
  .field-error::before {
    content: '!';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #c0606a;
    color: #fff;
    font-size: 8px;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* Oculta el ojo nativo del navegador */
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear,
  input[type="password"]::-webkit-contacts-auto-fill-button,
  input[type="password"]::-webkit-credentials-auto-fill-button { display: none !important; }

  .password-wrap { position: relative; }
  .password-wrap input { padding-right: 38px; }
  .toggle-pw {
    position: absolute;
    right: 11px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: #b09aa0; cursor: pointer; font-size: 14px; padding: 0;
    transition: color 0.2s;
  }
  .toggle-pw:hover { color: #c9536a; }

  .server-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff2f3;
    border: 1px solid #e8b4b8;
    border-left: 3px solid #c0606a;
    border-radius: 6px;
    padding: 9px 12px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #a04050;
  }
  .server-success {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f2faf5;
    border: 1px solid #b4dcc4;
    border-left: 3px solid #4a9e6e;
    border-radius: 6px;
    padding: 9px 12px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #2e6e4a;
  }

  .submit-btn {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #c9536a, #a03d52);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    box-shadow: 0 4px 16px rgba(201,83,106,0.3);
    margin-top: 4px;
  }
  .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .footer-note {
    text-align: center;
    font-size: 12px;
    color: #9c7a85;
    margin-top: 14px;
  }
  .footer-note a { color: #c9536a; text-decoration: none; cursor: pointer; font-weight: 500; }
  .footer-note a:hover { text-decoration: underline; }

  @media (max-width: 768px) {
    .split-image { display: none; }
    .split-form { padding: 24px; }
    html, body { overflow: auto; }
  }
`;

function validate(fields) {
  const errs = {};
  if (!fields.nombres.trim()) errs.nombres = "El nombre es requerido";
  if (!fields.apellidos.trim()) errs.apellidos = "El apellido es requerido";
  if (!fields.correo) errs.correo = "El correo es requerido";
  else if (!/\S+@\S+\.\S+/.test(fields.correo)) errs.correo = "Ingresa un correo valido";
  if (!fields.contrasena) errs.contrasena = "La contrasena es requerida";
  else if (fields.contrasena.length < 6) errs.contrasena = "Minimo 6 caracteres";
  if (!fields.confirmar) errs.confirmar = "Confirma tu contrasena";
  else if (fields.contrasena !== fields.confirmar) errs.confirmar = "Las contrasenas no coinciden";
  return errs;
}

export default function Register() {
  const navigate = useNavigate();
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    nombres: "", apellidos: "", correo: "", contrasena: "", confirmar: ""
  });

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: "" }));
    setServerMsg(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerMsg(null);
    setFieldErrors({});

    const errs = validate(form);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("https://beautyshop-production.up.railway.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:     `${form.nombres.trim()} ${form.apellidos.trim()}`,
          correo:     form.correo,
          contrasena: form.contrasena,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo crear la cuenta.");
      setServerMsg({ type: "success", msg: "Cuenta creada exitosamente. Redirigiendo al login..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerMsg({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="split-root">

        <div className="split-image">
          <img src={shopImage} alt="BeautyShop" />
        </div>

        <div className="split-form">
          <div className="form-inner">

            <div className="brand">
              <span className="brand-icon">🌹</span>
              <div className="brand-name">Beauty<span>Shop</span></div>
              <div className="brand-tagline">Tu tienda de maquillaje</div>
            </div>

            <p className="page-title">Crear cuenta</p>

            <form onSubmit={handleRegister} noValidate>

              {serverMsg && serverMsg.type === "error" && (
                <div className="server-error"><span>⚠️</span>{serverMsg.msg}</div>
              )}
              {serverMsg && serverMsg.type === "success" && (
                <div className="server-success"><span>✅</span>{serverMsg.msg}</div>
              )}

              {/* Nombres y apellidos en fila */}
              <div className="field-row">
                <div className="field">
                  <label>Nombres</label>
                  <input
                    type="text" value={form.nombres}
                    placeholder="Maria"
                    className={fieldErrors.nombres ? "error-input" : ""}
                    onChange={set("nombres")}
                    autoComplete="given-name"
                  />
                  {fieldErrors.nombres && <p className="field-error">{fieldErrors.nombres}</p>}
                </div>
                <div className="field">
                  <label>Apellidos</label>
                  <input
                    type="text" value={form.apellidos}
                    placeholder="Garcia"
                    className={fieldErrors.apellidos ? "error-input" : ""}
                    onChange={set("apellidos")}
                    autoComplete="family-name"
                  />
                  {fieldErrors.apellidos && <p className="field-error">{fieldErrors.apellidos}</p>}
                </div>
              </div>

              {/* Correo */}
              <div className="field">
                <label>Correo electronico</label>
                <input
                  type="email" value={form.correo}
                  placeholder="hola@beautyshop.co"
                  className={fieldErrors.correo ? "error-input" : ""}
                  onChange={set("correo")}
                  autoComplete="email"
                />
                {fieldErrors.correo && <p className="field-error">{fieldErrors.correo}</p>}
              </div>

              {/* Contrasena */}
              <div className="field">
                <label>Contrasena</label>
                <div className="password-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.contrasena}
                    placeholder="Minimo 6 caracteres"
                    className={fieldErrors.contrasena ? "error-input" : ""}
                    onChange={set("contrasena")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(s => !s)}>
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.contrasena && <p className="field-error">{fieldErrors.contrasena}</p>}
              </div>

              {/* Confirmar contrasena */}
              <div className="field">
                <label>Confirmar contrasena</label>
                <div className="password-wrap">
                  <input
                    type={showPw2 ? "text" : "password"}
                    value={form.confirmar}
                    placeholder="Repite tu contrasena"
                    className={fieldErrors.confirmar ? "error-input" : ""}
                    onChange={set("confirmar")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw2(s => !s)}>
                    {showPw2 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.confirmar && <p className="field-error">{fieldErrors.confirmar}</p>}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              <div className="footer-note">
                Ya tienes cuenta?{" "}
                <a onClick={() => navigate("/")}>Inicia sesion</a>
              </div>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}
