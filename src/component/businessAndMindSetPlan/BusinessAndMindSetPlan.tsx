import { Modal } from "antd";
import type { BusinessAndMindSetPlan } from ".";

export const GymAndFitnessPlanInfoModal: React.FC<{
  plan: BusinessAndMindSetPlan | null;
  open: boolean;
  onClose: () => void;
}> = ({ plan, open, onClose }) => {

  return (
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
          {/* Info Section */}
          <div style={{ padding: "28px 32px 20px 32px" }}>
            {/* Title */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 24,
                textShadow: "0 2px 12px #000",
              }}
            >
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
                  overflow: "auto",
                }}
                dangerouslySetInnerHTML={{ __html: plan.description }}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
