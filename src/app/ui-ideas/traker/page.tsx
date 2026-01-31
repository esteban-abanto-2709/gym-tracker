'use client'

import { useState } from 'react';

// Definir tipos
type WireframeElement = {
  type: string;
  content: string;
};

type Screen = {
  id: string;
  name: string;
  url: string;
  description: string;
  wireframe: WireframeElement[];
  notes: string[];
  nextScreens: string[];
};

type FlowState = {
  title: string;
  steps: string[];
};

export default function UXVisionV2() {
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  // Flujo simplificado mobile-first
  const screens: Screen[] = [
    {
      id: 'screen-1',
      name: 'Quick Start',
      url: '/app',
      description: 'Pantalla de inicio. Un solo botón grande para empezar a entrenar. Simple y directo.',
      wireframe: [
        { type: 'header', content: 'GymTrack' },
        { type: 'spacer', content: '' },
        { type: 'hero-text', content: 'Listo para entrenar?' },
        { type: 'button-huge', content: '💪 Nuevo Entrenamiento' },
        { type: 'spacer', content: '' },
        { type: 'hint', content: 'Toca para comenzar' },
      ],
      notes: [
        'Máxima simplicidad',
        'Botón protagonista',
        'Sin distracciones'
      ],
      nextScreens: ['screen-2']
    },
    {
      id: 'screen-2',
      name: 'Registrar Ejercicio',
      url: '/app/workout/exercise',
      description: 'Formulario de registro rápido. 3 campos obligatorios + 1 opcional. Inputs grandes para facilitar escritura con sudor en las manos.',
      wireframe: [
        { type: 'header', content: '← Registrar Ejercicio' },
        { type: 'input-large', content: 'Nombre del ejercicio' },
        { type: 'input-row', content: 'Peso (kg): [____]  |  Reps: [____]' },
        { type: 'input-large', content: 'Comentario (opcional)' },
        { type: 'button-primary', content: 'Registrar' },
        { type: 'hint', content: 'Se guardará automáticamente con fecha y hora' },
      ],
      notes: [
        'Inputs grandes y espaciados',
        'Teclado numérico para peso/reps',
        'Comentario colapsable o al final',
        'Un solo botón: Registrar'
      ],
      nextScreens: ['screen-3']
    },
    {
      id: 'screen-3',
      name: 'Post-Registro',
      url: '/app/workout/next',
      description: 'Confirmación visual + opciones claras. 2 botones grandes con íconos claros.',
      wireframe: [
        { type: 'success', content: '✓ Registrado:\nPress de Banca - 60kg × 12 reps' },
        { type: 'spacer', content: '' },
        { type: 'section-title', content: 'Qué sigue?' },
        { type: 'button-primary', content: '↻ Nueva Serie\n(mismo ejercicio)' },
        { type: 'button-secondary', content: '➕ Otro Ejercicio' },
        { type: 'spacer', content: '' },
        { type: 'hint', content: 'Cierra la app cuando termines de entrenar' },
      ],
      notes: [
        'Feedback visual inmediato',
        'Botones con texto descriptivo',
        '2 opciones claras, sin "Finalizar"',
        'El usuario cierra cuando quiere'
      ],
      nextScreens: ['screen-4', 'screen-2']
    },
    {
      id: 'screen-4',
      name: 'Nueva Serie (Pre-llenado)',
      url: '/app/workout/exercise?mode=repeat',
      description: 'Misma pantalla de registro pero con datos del ejercicio anterior. Usuario solo cambia peso/reps si es necesario.',
      wireframe: [
        { type: 'header', content: '← Nueva Serie' },
        { type: 'input-large-filled', content: 'Press de Banca' },
        { type: 'input-row-filled', content: 'Peso (kg): [60]  |  Reps: [12]' },
        { type: 'input-large', content: 'Comentario (opcional)' },
        { type: 'button-primary', content: 'Registrar Serie' },
        { type: 'hint', content: 'Edita solo lo que cambió' },
      ],
      notes: [
        'Campos pre-llenados con último registro',
        'Nombre deshabilitado o readonly',
        'Focus automático en campo Peso',
        'Misma funcionalidad que Screen 2'
      ],
      nextScreens: ['screen-3']
    },
  ];

  // Estados del flujo
  const flowStates: FlowState[] = [
    {
      title: 'Flujo Típico: 3 ejercicios, 3 series cada uno',
      steps: [
        'Usuario abre app → Screen 1',
        'Toca "Nuevo Entrenamiento" → Screen 2',
        'Registra: Press Banca, 60kg, 12 reps → Screen 3',
        'Toca "Nueva Serie" → Screen 4 (pre-llenado)',
        'Ajusta: 65kg, 10 reps → Screen 3',
        'Toca "Nueva Serie" → Screen 4',
        'Ajusta: 70kg, 8 reps → Screen 3',
        'Toca "Otro Ejercicio" → Screen 2 (vacío)',
        'Registra: Press Inclinado, 50kg, 12 reps → Screen 3',
        '... repite proceso ...',
        'Cierra app cuando termina'
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: '900',
          background: 'linear-gradient(to right, #FF7A00, #FF4500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          GymTrack UX v2
        </h1>
        <p style={{
          color: '#888',
          fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Flujo optimizado para registro rápido. Mobile-first, velocidad sobre todo.
        </p>
      </div>

      {/* Key Principles */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 3rem',
        background: 'linear-gradient(135deg, #1a1a1a, #252525)',
        border: '2px solid #FF7A00',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(255, 122, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          marginBottom: '1rem',
          color: '#FF7A00',
          fontWeight: '700'
        }}>
          🎯 Principios de Diseño
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          color: '#ccc'
        }}>
          <div>
            <strong style={{ color: '#fff' }}>⚡ Velocidad</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0', color: '#999' }}>
              Mínimo 2 taps para registrar una serie
            </p>
          </div>
          <div>
            <strong style={{ color: '#fff' }}>📱 Mobile-First</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0', color: '#999' }}>
              Diseñado para dedos con sudor
            </p>
          </div>
          <div>
            <strong style={{ color: '#fff' }}>🚫 Sin Confirmaciones</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0', color: '#999' }}>
              Nada de "¿Estás seguro?" molestos
            </p>
          </div>
          <div>
            <strong style={{ color: '#fff' }}>✏️ Solo Inputs</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0', color: '#999' }}>
              Sin dropdowns, sin selectors
            </p>
          </div>
        </div>
      </div>

      {/* Screens Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 3rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {screens.map((screen, index) => (
          <div
            key={screen.id}
            onClick={() => setSelectedScreen(selectedScreen?.id === screen.id ? null : screen)}
            style={{
              background: selectedScreen?.id === screen.id
                ? 'linear-gradient(135deg, #2a2a2a, #1f1f1f)'
                : '#1a1a1a',
              border: selectedScreen?.id === screen.id ? '3px solid #FF7A00' : '2px solid #333',
              borderRadius: '20px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (selectedScreen?.id !== screen.id) {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(255, 122, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(255,122,0,0.1), transparent)',
              pointerEvents: 'none'
            }} />

            {/* Screen Number Badge */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '1rem',
              background: 'linear-gradient(135deg, #FF7A00, #FF4500)',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.4)'
            }}>
              {index + 1}
            </div>

            {/* Screen Header */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                fontSize: '1.375rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#fff'
              }}>
                {screen.name}
              </h3>

              {/* URL */}
              <div style={{
                fontSize: '0.75rem',
                color: '#FF7A00',
                fontFamily: 'monospace',
                background: '#0a0a0a',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                overflow: 'auto',
                border: '1px solid #333'
              }}>
                {screen.url}
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '0.875rem',
              color: '#aaa',
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              {screen.description}
            </p>

            {/* Mobile Wireframe */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '1rem',
              minHeight: '320px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Phone notch simulation */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40%',
                height: '20px',
                background: '#000',
                borderRadius: '0 0 12px 12px'
              }} />

              {/* Wireframe content */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingTop: '1.5rem'
              }}>
                {screen.wireframe.map((element, idx) => (
                  <WireframeElement key={idx} {...element} />
                ))}
              </div>
            </div>

            {/* Design Notes (expandable) */}
            {selectedScreen?.id === screen.id && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#0a0a0a',
                borderRadius: '8px',
                border: '1px solid #333',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  color: '#FF7A00',
                  marginBottom: '0.5rem',
                  fontWeight: '600'
                }}>
                  📝 Notas de Diseño
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  fontSize: '0.75rem',
                  color: '#999',
                  lineHeight: '1.8'
                }}>
                  {screen.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation arrows */}
            {screen.nextScreens.length > 0 && (
              <div style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#666',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <span style={{ color: '#888' }}>→</span>
                {screen.nextScreens.map(nextId => {
                  const nextScreen = screens.find(s => s.id === nextId);
                  return (
                    <span key={nextId} style={{
                      background: '#2a2a2a',
                      color: '#FF7A00',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: '1px solid #333'
                    }}>
                      {nextScreen?.name || nextId}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Flow Example */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #1a1a1a, #252525)',
        border: '2px solid #333',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '1.5rem',
          color: '#FF7A00',
          fontWeight: '700'
        }}>
          🏃 Ejemplo de Flujo Real
        </h3>

        {flowStates.map((flow, idx) => (
          <div key={idx} style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              color: '#fff',
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {flow.title}
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {flow.steps.map((step, stepIdx) => (
                <div
                  key={stepIdx}
                  style={{
                    padding: '0.75rem 1rem',
                    background: stepIdx % 2 === 0 ? '#0a0a0a' : '#1a1a1a',
                    borderLeft: '3px solid #FF7A00',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#ccc',
                    fontFamily: 'monospace'
                  }}
                >
                  <span style={{ color: '#FF7A00', marginRight: '0.5rem' }}>
                    {String(stepIdx + 1).padStart(2, '0')}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Key Insights */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#0a0a0a',
          borderRadius: '12px',
          border: '2px solid #FF7A00'
        }}>
          <h4 style={{
            color: '#FF7A00',
            fontWeight: '600',
            marginBottom: '1rem',
            fontSize: '1rem'
          }}>
            💡 Insights Clave
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.8'
          }}>
            <div>
              <strong style={{ color: '#fff' }}>Entrenamiento de 9 series:</strong>
              <p style={{ color: '#999', margin: '0.25rem 0 0' }}>
                Solo 19 taps totales (2.1 taps/serie)
              </p>
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Sin interrupciones:</strong>
              <p style={{ color: '#999', margin: '0.25rem 0 0' }}>
                Usuario entrena, registra, cierra app. Nada más.
              </p>
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Pre-llenado inteligente:</strong>
              <p style={{ color: '#999', margin: '0.25rem 0 0' }}>
                70% de las series solo ajustan peso/reps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        maxWidth: '1200px',
        margin: '3rem auto 0',
        textAlign: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #FF7A00, #FF4500)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(255, 122, 0, 0.3)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
          fontWeight: '700'
        }}>
          ✅ ¿Listo para implementar?
        </h3>
        <p style={{
          fontSize: '1rem',
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Revisa cada pantalla, dame tu feedback y te implemento las páginas una por una.
        </p>
      </div>
    </div>
  );
}

// Wireframe components
function WireframeElement({ type, content }: { type: string; content: string }) {
  const baseStyle: React.CSSProperties = {
    borderRadius: '6px',
    fontSize: '0.75rem',
  };

  const styles: Record<string, React.CSSProperties> = {
    header: {
      ...baseStyle,
      padding: '0.75rem',
      background: '#f5f5f5',
      borderBottom: '2px solid #ddd',
      fontWeight: '600',
      color: '#333',
      position: 'sticky',
      top: 0
    },
    spacer: {
      height: '1.5rem'
    },
    'hero-text': {
      padding: '1rem',
      fontSize: '1.25rem',
      fontWeight: '700',
      textAlign: 'center',
      color: '#333'
    },
    'button-huge': {
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #FF7A00, #FF4500)',
      color: '#fff',
      borderRadius: '12px',
      fontWeight: '700',
      textAlign: 'center',
      fontSize: '1rem',
      boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
      border: 'none'
    },
    'button-primary': {
      ...baseStyle,
      padding: '1rem',
      background: '#FF7A00',
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
      border: 'none'
    },
    'button-secondary': {
      ...baseStyle,
      padding: '1rem',
      background: 'transparent',
      border: '2px solid #999',
      color: '#666',
      fontWeight: '600',
      textAlign: 'center'
    },
    'input-large': {
      ...baseStyle,
      padding: '1rem',
      background: '#fff',
      border: '2px solid #ddd',
      color: '#999',
      fontWeight: '400'
    },
    'input-large-filled': {
      ...baseStyle,
      padding: '1rem',
      background: '#f0f0f0',
      border: '2px solid #999',
      color: '#333',
      fontWeight: '500'
    },
    'input-row': {
      ...baseStyle,
      padding: '1rem',
      background: '#fff',
      border: '2px solid #ddd',
      color: '#999',
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'space-between',
      fontFamily: 'monospace'
    },
    'input-row-filled': {
      ...baseStyle,
      padding: '1rem',
      background: '#f0f0f0',
      border: '2px solid #999',
      color: '#333',
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'space-between',
      fontFamily: 'monospace',
      fontWeight: '500'
    },
    success: {
      ...baseStyle,
      padding: '1.5rem',
      background: '#e8f5e9',
      border: '2px solid #4caf50',
      color: '#2e7d32',
      fontWeight: '600',
      textAlign: 'center',
      whiteSpace: 'pre-line'
    },
    'section-title': {
      padding: '0.5rem 0',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    hint: {
      padding: '0.5rem',
      fontSize: '0.7rem',
      color: '#999',
      textAlign: 'center',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={styles[type] || baseStyle}>
      {content}
    </div>
  );
}