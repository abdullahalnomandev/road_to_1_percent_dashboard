import { Modal } from "antd";
import type { GymAndFitnessPlan } from ".";
import { imageUrl } from "../../redux/api/baseApi";

export const GymAndFitnessPlanInfoModal: React.FC<{
    plan: GymAndFitnessPlan | null;
    open: boolean;
    onClose: () => void;
}> = ({ plan, open, onClose }) => (
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
        {plan && (
            <div style={{ padding: 0 }}>
                {/* Image Section */}
                <div style={{ position: "relative", marginTop:22, width: "100%", height: 220, background: "#121415", borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: "hidden" }}>
                    {plan.image ? (
                        <img
                            src={`${imageUrl}/${plan.image}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                filter: "brightness(0.65)"
                            }}
                            alt={plan.title}
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
                    <div style={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: "#fff",
                        marginBottom: 24,
                        textShadow: "0 2px 12px #000"
                    }}>
                        {plan.title}
                    </div>
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
                            dangerouslySetInnerHTML={{ __html: plan.description }}
                        />
                    </div>
                </div>
            </div>
        )}
    </Modal>
);
