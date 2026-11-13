export function installMobileControls({onMove, onAction}) {
  const pad = document.querySelector('#joystick');
  const knob = document.querySelector('#stick');
  const action = document.querySelector('#touch-action');
  let activePointer = null;

  function update(event) {
    const rect = pad.getBoundingClientRect();
    const radius = rect.width * .34;
    let x = (event.clientX - rect.left - rect.width / 2) / radius;
    let y = (event.clientY - rect.top - rect.height / 2) / radius;
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) { x /= magnitude; y /= magnitude; }
    const travel = (rect.width - knob.getBoundingClientRect().width) / 2 - 4;
    knob.style.transform = `translate(${x * travel}px, ${y * travel}px)`;
    onMove(x, y);
  }

  function release(event) {
    if (activePointer !== event.pointerId) return;
    activePointer = null;
    knob.style.transform = '';
    onMove(0, 0);
  }

  pad.addEventListener('pointerdown', event => {
    if (activePointer !== null) return;
    event.preventDefault();
    activePointer = event.pointerId;
    pad.setPointerCapture(activePointer);
    update(event);
  });
  pad.addEventListener('pointermove', event => {
    if (event.pointerId === activePointer) update(event);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    pad.addEventListener(name, release);
  }
  window.addEventListener('blur', () => {
    activePointer = null;
    knob.style.transform = '';
    onMove(0, 0);
  });
  action.addEventListener('click', onAction);

  return {
    showAction(label) {
      action.textContent = label;
      action.setAttribute('aria-label', label);
      action.hidden = false;
    },
    hideAction() { action.hidden = true; }
  };
}
