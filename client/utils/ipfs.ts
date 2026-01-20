const JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const uploadToIPFS = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
      body: formData,
    });

    const data = await res.json();
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return null;
  }
};