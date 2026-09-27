import ElectricLogo from './ElectricLogo.jsx';

/**
 * Component Hiệu ứng Điện ảnh (Electric Logo Effect)
 * Nguồn: React Bits (https://reactbits.dev/animations/electric-logo)
 * 
 * Đã cấu hình theo các tham số từ control panel người dùng cung cấp:
 * - glowColor: #1173fb
 * - scale: 1
 * - intensity: 0.5
 * - glow: 0.8
 * - fill: 0
 * - thickness: 0.5
 * - strands: 6
 * - bend: 0
 * - crackle: 0
 * - arcs: 0.4
 * - flicker: 0.6
 * - speed: 0
 * - interactive: true
 * - cursorIntensity: 2
 * - cursorRadius: 180
 */
export default function HotelElectricLogo({
    src = '/hotel-building-logo.png',
    size = 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72',
    scale = 1,
    glowColor = '#1173fb',
    intensity = 0.5,
    glow = 0.8,
    fill = 0,
    thickness = 0.5,
    strands = 6,
    bend = 0,
    crackle = 0,
    arcs = 0.4,
    flicker = 0.6,
    speed = 0,
    interactive = true,
    cursorIntensity = 2,
    cursorRadius = 180,
    className = ''
}) {
    return (
        <div className={`relative ${size} flex-shrink-0 flex items-center justify-center overflow-visible ${className}`}>
            <ElectricLogo
                src={src}
                color="#ffffff"
                glowColor={glowColor}
                scale={scale}
                intensity={intensity}
                glow={glow}
                fill={fill}
                thickness={thickness}
                strands={strands}
                bend={bend}
                crackle={crackle}
                arcs={arcs}
                flicker={flicker}
                speed={speed}
                interactive={interactive}
                cursorIntensity={cursorIntensity}
                cursorRadius={cursorRadius}
                className="w-full h-full"
            />
        </div>
    );
}
