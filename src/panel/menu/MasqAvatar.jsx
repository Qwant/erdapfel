import React from 'react';

const MasqAvatar = ({ user, className = '', ...rest }) => {
  const { profileImage, defaultProfileImage } = user;
  return <div className={`masqAvatar ${className}`} {...rest}>
    { profileImage
      ? <img className="masqAvatar-image" src={profileImage} />
      : <div className={`masqAvatar-letter ${defaultProfileImage.backgroundColor}`}>
        {defaultProfileImage.letter}
      </div>
    }
  </div>;
};

export default MasqAvatar;
