import { FiSearch } from "react-icons/fi";
import MealCategory, {
  type MealCategoryType,
} from "../../component/mealPreRecipe/category";
import { Button, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import Meal from "../../component/mealPreRecipe/meal";

const MealPrepRecipesPage: React.FC = () => {
  const [editItem, setEditItem] = useState<MealCategoryType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(true);

  const handleCreate = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  return (
    <div>
      {/* Top Actions */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type={selectedCategory ? "primary" : "default"}
            onClick={() => setSelectedCategory(true)}
            style={
              selectedCategory
                ? { height: 40, borderRadius: 50 }
                : { height: 40, borderRadius: 50, background: "#1C1C1C", color: "#ffff" }
            }
          >
            Categories
          </Button>
          <Button
            type={!selectedCategory ? "primary" : "default"}
            onClick={() => setSelectedCategory(false)}
            style={
              !selectedCategory
                ? { height: 40, borderRadius: 50 }
                : { height: 40, borderRadius: 50, background: "#1C1C1C", color: "#ffff" }
            }
            // onClick for Meal Recipe can be added here
          >
            Meal Recipes
          </Button>
        </div>
        <div />
        <div style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#232323",
              borderRadius: 32,
              padding: "6px 18px 6px 8px",
              boxShadow: "0px 2px 9px 0px rgba(0,0,0,0.15)",
              width: 350,
              minHeight: 44,
              height: 40,
            }}
          >
            <div
              style={{
                background: "#94B341",
                borderRadius: "100%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 5,
                boxShadow: "0 1px 4px rgba(0,0,0,0.09)",
              }}
            >
              <FiSearch style={{ fontSize: 14, color: "#232323", margin: 0 }} />
            </div>
            <Input
              type="text"
              placeholder="Search meal categories"
              // value={search}
              // onChange={(e) => {
              //   setSearch(e.target.value);
              //   setPage(1);
              // }}
              style={{
                background: "transparent",
                color: "#f4f4f5",
                border: "none",
                fontSize: 18,
                width: "85%",
                fontWeight: 400,
                letterSpacing: 0.2,
                outline: "none",
                boxShadow: "none",
              }}
              className="user-search-input-white-clear user-search-input-gray-placeholder"
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ height: 40, borderRadius: 50 }}
            onClick={handleCreate}
          >
            {
              selectedCategory ? "Add Category" : "Add Meal"
            }
          </Button>
        </div>
      </div>

      {selectedCategory ? (
        <MealCategory
          editItem={editItem}
          setEditItem={setEditItem}
          formOpen={formOpen}
          setFormOpen={setFormOpen}
        />
      ) : (
        <Meal
        //@ts-ignore
          editItem={editItem}
                  //@ts-ignore
          setEditItem={setEditItem}
          formOpen={formOpen}
          setFormOpen={setFormOpen}
        />
      )}
    </div>
  );
};

export default MealPrepRecipesPage;
