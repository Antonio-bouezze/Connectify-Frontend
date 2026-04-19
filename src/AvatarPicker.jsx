import { USER_ICONS, ROOM_ICONS, COLORS } from "./iconRegistry";

function AvatarPicker({
  type = "user", 
  selectedIcon,
  selectedColor,
  onSelectIcon,
  onSelectColor,
}) {
  const icons = type === "room" ? ROOM_ICONS : USER_ICONS;

  return (
    <div className="avatar-picker">
      <div className="icon-grid">
        {icons.map((icon) => {
          const IconComp = icon.component;

          return (
            <div
              key={icon.name}
              className={`icon-item ${selectedIcon === icon.name ? "active" : ""}`}
              onClick={() => onSelectIcon(icon.name)}
            >
              <IconComp
                style={
                  type === "user"
                    ? { color: selectedColor || "#ffffff" }
                    : {}
                }
              />
            </div>
          );
        })}
      </div>

      
      {type === "user" && selectedIcon && (
        <div className="color-grid">
          {COLORS.map((color) => (
            <div
              key={color}
              className="color-item"
              style={{ background: color }}
              onClick={() => onSelectColor(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AvatarPicker;