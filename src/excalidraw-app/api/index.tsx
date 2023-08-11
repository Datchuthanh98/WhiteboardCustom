const apiEndpoint = process.env.REACT_APP_ROOM_SERVER_URL;

async function startWhiteboard(
  idConnection: string,
  idRoom: string,
  token: string,
  isEditWhiteboardCommon: boolean,
  whiteboardLink: string,
) {
  const response = await fetch(
    `${apiEndpoint}/rooms/${idRoom}/conns/${idConnection}/startWhiteboard`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ whiteboardLink, isEditWhiteboardCommon }),
    },
  );

  const { data, error } = await response.json();

  if (error) {
    throw new Error(error);
  }

  return {
    data,
  };
}

async function stopWhiteboard(
  idConnection: string,
  idRoom: string,
  token: string,
) {
  const response = await fetch(
    `${apiEndpoint}/rooms/${idRoom}/conns/${idConnection}/stopWhiteboard`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isCloseLocal: true }),
    },
  );

  const { data, error } = await response.json();

  if (error) {
    throw new Error(error);
  }

  return {
    data,
  };
}

export default Object.freeze({
  startWhiteboard,
  stopWhiteboard,
});
