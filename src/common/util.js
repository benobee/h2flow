export const toArray = (nodeList) => {
    return [].slice.call(nodeList);
};

// Load all images via Squarespace's Responsive ImageLoader
export const loadAllImages = () => {
    const images = document.querySelectorAll("img[data-src]" );

    for (let i = 0; i < images.length; i++) {
      ImageLoader.load(images[ i ], { load: true });
    }
};