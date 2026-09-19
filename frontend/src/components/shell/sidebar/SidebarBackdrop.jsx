function SidebarBackdrop({ onClick }) {
  return (
    <div
      role="presentation"
      onClick={onClick}
      className="fixed inset-0 z-30 bg-black/40 md:hidden"
    />
  );
}

export default SidebarBackdrop;
