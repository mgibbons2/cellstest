export default function ColorPicker({ open, title, onChoose, onCancel }) {
  return (
    <div className={`modal-backdrop${open ? ' show' : ''}`}>
      <div className="cp-box">
        <div className="cp-title">{title}</div>
        <div className="cp-swatches">
          {[0, 1, 2].map(c => (
            <div
              key={c}
              className="cp-swatch"
              data-color={c}
              onClick={() => onChoose(c)}
            />
          ))}
        </div>
        <button className="cp-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
