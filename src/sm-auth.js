import Cookies from 'js-cookie';

const redirectURL = 'http://localhost:8601/';

export const login = () => {
    window.location.href = `http://localhost:3000/auth?redirect=${redirectURL}`;
};

export const logout = () => {
    window.location.href = `http://localhost:3000/logout?redirect=${redirectURL}`;
};

// eslint-disable-next-line no-eq-null, eqeqeq
export const isLoggedIn = () => Cookies.get('name') != null;

export const getName = () => {
    if (isLoggedIn()) return Cookies.get('name');
    return null;
};

// eslint-disable-next-line no-return-await
export const getDetails = async () => await (await fetch(`https://scratchdb.lefty.one/v3/user/info/${getName()}`)).json();

export const getIcon = async scale => `https://uploads.scratch.mit.edu/get_image/user/${(await getDetails()).id}_${scale}.png`;

// Ugly hack

// eslint-disable-next-line import/no-mutable-exports
export let icon64 = '';
(async () => {
    icon64 = await getIcon('64x64');
})();
