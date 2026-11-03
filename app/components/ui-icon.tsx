type IconName = "home" | "report" | "folder" | "plus" | "check" | "clock" | "search" | "arrow" | "clients" | "theme";
export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    clients: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    theme: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z",
    home: "m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6 11v-8h6v8",
    report: "M5 3h14v18H5zM8 7h8M8 11h3M8 15h8",
    folder: "M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z",
    plus: "M12 5v14M5 12h14", check: "m5 12 4 4L19 6",
    clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    arrow: "M5 12h14m-6-6 6 6-6 6",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

