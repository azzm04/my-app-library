export const generateShareUrl = (bookId: number): string => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  return `${baseUrl}/buku/${bookId}`
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error("Failed to copy to clipboard:", err)
    return false
  }
}
