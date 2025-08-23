const getPhantomProvider = () => {
  const provider = window.phantom?.ethereum
  if (!provider) {
    throw new Error('Phantom wallet is not installed!')
  }
  return provider
}

export { getPhantomProvider }
