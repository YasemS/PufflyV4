import { useNavigation } from "react-router";

export default function Loader() {
  const navigation = useNavigation();

  const loading = navigation.state !== "idle";

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-pink-950 z-20">
      <div className="absolute top-0 left-0 w-1/4 h-full bg-pink-500 loading__bar__inner"></div>
    </div>
  );
}
