import { DemoCompositions } from "./Demo";
import { ChangeCompositions } from "./ChangeDemo";
import { TechniqueCompositions } from "./TechniqueDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <DemoCompositions />
      <ChangeCompositions />
      <TechniqueCompositions />
    </>
  );
};
