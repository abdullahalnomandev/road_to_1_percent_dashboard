import { Modal } from "antd";
import type { MealType } from ".";
import { imageUrl } from "../../../redux/api/baseApi";

export const MealViewModel: React.FC<{
    meal: MealType | null;
    open: boolean;
    onClose: () => void;
}> = ({ meal, open, onClose }) => (
    <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={600}
        styles={{
            body: {
                background: "#181c1f",
                color: "#fff",
                padding: 0,
            },
        }}
    >
        {meal && (
            <div style={{ padding: 0 }}>
                {/* Image Section */}
                <div style={{ position: "relative", marginTop: 22, width: "100%", height: 220, background: "#121415", borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden" }}>
                    {meal.image ? (
                        <img
                            src={`${imageUrl}/${meal.image}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                filter: "brightness(0.65)"
                            }}
                            alt={meal.name}
                        />
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#25282c",
                                color: "#aaa",
                                fontSize: 16,
                                filter: "brightness(0.7)"
                            }}
                        >
                            No image available
                        </div>
                    )}
                </div>
                {/* Info Section */}
                <div style={{ padding: "28px 32px 20px 32px" }}>
                    {/* Title */}
                    {/* <div style={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: 24,
                        textShadow: "0 2px 12px #000"
                    }}>
                        {meal.name}
                    </div> */}
                    {/* Description */}
                    <div style={{ marginBottom: 24 }}>
                        <div
                            style={{
                                color: "#eee",
                                fontSize: 15,
                                lineHeight: 1.7,
                                minHeight: 44,
                                marginBottom: 4,
                                maxHeight: 300,
                                overflow: "auto"
                            }}
                            dangerouslySetInnerHTML={{ __html: meal.description || "" }}
                        />
                    </div>
                </div>
            </div>
        )}
    </Modal>
);
