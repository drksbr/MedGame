/**
 * Estilos para o editor de mapas
 */
export function setupStyles(): void {
  const style = document.createElement("style");
  style.textContent = `
      body, html {
        margin: 0;
        padding: 0;
        overflow: hidden;
        font-family: 'Roboto', sans-serif;
        height: 100%;
      }
      
      /* Barra de ferramentas */
      .editor-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 220px;
        background-color: #2c3e50;
        color: white;
        z-index: 1000;
        padding: 10px;
        overflow-y: auto;
      }
      
      .sidebar-header {
        padding: 10px 0;
        margin-bottom: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .sidebar-header h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
      
      .sidebar-section {
        margin-bottom: 20px;
      }
      
      .sidebar-section h2 {
        font-size: 14px;
        margin: 0 0 10px 0;
        color: rgba(255,255,255,0.7);
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .sidebar-buttons, .sidebar-objects {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      
      .sidebar-button, .object-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border: none;
        border-radius: 4px;
        background-color: rgba(255,255,255,0.1);
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .sidebar-button:hover, .object-button:hover {
        background-color: rgba(255,255,255,0.2);
      }
      
      .sidebar-button.active, .object-button.active {
        background-color: #3498db;
      }
      
      .sidebar-button svg, .object-button svg {
        margin-bottom: 5px;
      }
      
      .sidebar-button span, .object-button span {
        font-size: 12px;
      }
      
      .sidebar-help ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      
      .sidebar-help li {
        margin-bottom: 6px;
        font-size: 12px;
      }
      
      .sidebar-help strong {
        display: inline-block;
        margin-right: 5px;
        color: #3498db;
      }
      
      /* Painel de propriedades */
      .properties-panel {
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 250px;
        background-color: white;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        z-index: 1000;
        padding: 15px;
        overflow-y: auto;
      }
      
      .properties-panel h2 {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #2c3e50;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      
      .no-selection {
        padding: 20px 0;
        color: #999;
        text-align: center;
        font-style: italic;
      }
      
      .hidden {
        display: none;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 500;
        color: #666;
      }
      
      .form-group input[type="text"],
      .form-group input[type="number"] {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .form-group input[type="color"] {
        width: 100%;
        height: 35px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .apply-button {
        width: 100%;
        padding: 8px 12px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 10px;
      }
      
      .apply-button:hover {
        background-color: #2980b9;
      }
      
      /* Layout principal */
      #editor-container {
        position: absolute;
        left: 220px;
        right: 250px;
        top: 0;
        bottom: 0;
      }
      
      /* Cursores específicos */
      .cursor-select {
        cursor: pointer;
      }
      
      .cursor-add {
        cursor: cell;
      }
      
      .cursor-delete {
        cursor: no-drop;
      }
      
      /* Modal */
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .modal-content {
        background-color: white;
        border-radius: 8px;
        padding: 20px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      }
      
      .modal h2 {
        margin-bottom: 20px;
        color: #2c3e50;
      }
      
      .map-list {
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 20px;
      }
      
      .map-item {
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s;
      }
      
      .map-item:hover {
        background-color: #f5f5f5;
      }
      
      .map-name {
        font-weight: 500;
        color: #333;
      }
      
      .map-date {
        font-size: 12px;
        color: #777;
      }
      
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      
      .modal-actions button {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      /* Loading overlay */
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
      }
      
      .loading-overlay.hidden {
        display: none;
      }
      
      .spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 4px solid white;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Messages */
      .message-area {
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 900;
        max-width: 300px;
      }
      
      .message {
        padding: 10px 15px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: messageSlide 0.3s ease-out;
      }
      
      .message.success {
        background-color: #2ecc71;
        color: white;
      }
      
      .message.error {
        background-color: #e74c3c;
        color: white;
      }
      
      .message.info {
        background-color: #3498db;
        color: white;
      }
      
      @keyframes messageSlide {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;

  document.head.appendChild(style);
}
