import { useCallback, useEffect, useState } from 'react';
import './Perfil.css';

const API = "https://beautyshop-production.up.railway.app/api";
const EMPTY_VALUE = '-';

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function Perfil() {
  const rawUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
  const userId = rawUserId && Number(rawUserId) > 0 ? String(Number(rawUserId)) : '';

  const [tab, setTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [userData, setUserData] = useState({ nombre: '', correo: '', direccion: '' });
  const [editing, setEditing] = useState(false);

  const [pwData, setPwData] = useState({ contrasena_actual: '', contrasena_nueva: '', confirmar: '' });
  const [showPw, setShowPw] = useState(false);

  const showMsg = useCallback((type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }, []);

  const loadUser = useCallback(async () => {
    if (!userId) {
      showMsg('error', 'Usuario no identificado. Inicia sesion nuevamente.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/usuarios/${userId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al cargar perfil');

      setUserData({
        nombre: data.nombre || '',
        correo: data.correo || '',
        direccion: data.direccion || '',
      });
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [showMsg, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser();
  }, [loadUser]);

  const handleSavePerfil = async () => {
    if (!userData.nombre.trim()) return showMsg('error', 'El nombre es requerido.');
    if (!userData.direccion.trim()) return showMsg('error', 'La direccion es requerida.');

    setSaving(true);
    try {
      const res = await fetch(`${API}/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: userData.nombre,
          correo: userData.correo,
          direccion: userData.direccion,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al actualizar');

      localStorage.setItem('userName', userData.nombre);
      setEditing(false);
      showMsg('success', 'Perfil actualizado correctamente.');
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!pwData.contrasena_actual || !pwData.contrasena_nueva || !pwData.confirmar) {
      return showMsg('error', 'Completa todos los campos.');
    }
    if (pwData.contrasena_nueva !== pwData.confirmar) {
      return showMsg('error', 'Las contrasenas no coinciden.');
    }
    if (pwData.contrasena_nueva.length < 6) {
      return showMsg('error', 'La nueva contrasena debe tener al menos 6 caracteres.');
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/usuarios/${userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contrasena_actual: pwData.contrasena_actual,
          contrasena_nueva: pwData.contrasena_nueva,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al cambiar contrasena');

      setPwData({ contrasena_actual: '', contrasena_nueva: '', confirmar: '' });
      showMsg('success', 'Contrasena actualizada correctamente.');
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = userData.nombre
    ? userData.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  if (loading) {
    return (
      <div className="perfil-container">
        <p className="perfil-loading">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-avatar-card">
        <div className="perfil-avatar">{initials}</div>
        <div className="perfil-avatar-copy">
          <div className="perfil-avatar-name">{userData.nombre || EMPTY_VALUE}</div>
          <div className="perfil-avatar-correo">{userData.correo || EMPTY_VALUE}</div>
        </div>
      </div>

      <div className="perfil-tabs">
        <button
          className={`perfil-tab${tab === 'info' ? ' active' : ''}`}
          onClick={() => { setTab('info'); setMsg(null); setEditing(false); }}
        >
          Informacion personal
        </button>
        <button
          className={`perfil-tab${tab === 'password' ? ' active' : ''}`}
          onClick={() => { setTab('password'); setMsg(null); }}
        >
          Cambiar contrasena
        </button>
      </div>

      {msg && (
        <div className={`perfil-alert perfil-alert-${msg.type}`}>
          {msg.text}
        </div>
      )}

      {tab === 'info' && (
        <div className="perfil-card">
          <div className="perfil-card-header">
            <span className="perfil-card-title">Datos personales</span>
            {!editing && (
              <button className="perfil-btn-outline" onClick={() => setEditing(true)}>
                Editar
              </button>
            )}
          </div>

          <div className="perfil-card-body">
            <div className="perfil-field">
              <label>Nombre completo</label>
              {editing ? (
                <input
                  className="perfil-input"
                  value={userData.nombre}
                  onChange={e => setUserData(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Tu nombre completo"
                />
              ) : (
                <p>{userData.nombre || EMPTY_VALUE}</p>
              )}
            </div>

            <div className="perfil-field">
              <label>Correo electronico</label>
              <p className="perfil-readonly">
                <span className="perfil-readonly-value">{userData.correo || EMPTY_VALUE}</span>
                <span>No se puede cambiar</span>
              </p>
            </div>

            <div className="perfil-field">
              <label>Direccion de envio</label>
              {editing ? (
                <input
                  className="perfil-input"
                  value={userData.direccion}
                  onChange={e => setUserData(p => ({ ...p, direccion: e.target.value }))}
                  placeholder="Calle 10 # 5-20, Medellin"
                />
              ) : (
                <p>{userData.direccion || EMPTY_VALUE}</p>
              )}
            </div>

            {editing && (
              <div className="perfil-actions">
                <button
                  className="perfil-btn-cancel"
                  onClick={() => { setEditing(false); loadUser(); }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="perfil-btn-primary"
                  onClick={handleSavePerfil}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div className="perfil-card">
          <div className="perfil-card-header">
            <span className="perfil-card-title">Cambiar contrasena</span>
          </div>
          <div className="perfil-card-body">
            {[
              { key: 'contrasena_actual', label: 'Contrasena actual', placeholder: '********' },
              { key: 'contrasena_nueva', label: 'Nueva contrasena', placeholder: 'Minimo 6 caracteres' },
              { key: 'confirmar', label: 'Confirmar nueva contrasena', placeholder: 'Repite tu contrasena' },
            ].map(f => (
              <div className="perfil-field" key={f.key}>
                <label>{f.label}</label>
                <div className="perfil-pw-wrap">
                  <input
                    className="perfil-input"
                    type={showPw ? 'text' : 'password'}
                    value={pwData[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setPwData(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                  <button type="button" className="perfil-pw-toggle" onClick={() => setShowPw(s => !s)}>
                    {showPw ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>
            ))}

            <div className="perfil-actions">
              <button
                className="perfil-btn-primary perfil-btn-full"
                onClick={handleSavePassword}
                disabled={saving}
              >
                {saving ? 'Actualizando...' : 'Actualizar contrasena'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
