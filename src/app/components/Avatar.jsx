import React, { useState } from "react";

const Avatar = ({url}) => {
    const [imgSrc,setImgSrc] = useState(url)
  return (
    <>
      <img
        id="avatarButton"
        type="button"
        className="w-8 h-8 rounded-full cursor-pointer"
        src={url}
        alt="profile-img"
        onError={() => setImgSrc("./person-img.png")}
      />
    </>
  );
};

export default Avatar;
