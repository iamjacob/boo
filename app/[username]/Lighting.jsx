const Lighting = () => {
  return (
    <>
    <ambientLight intensity={1} />
      <directionalLight position={[0, 10, 0]} intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <directionalLight position={[-10, -10, -5]} intensity={2} />
    </>
  )
}

export default Lighting