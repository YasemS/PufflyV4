type ImgOpts = {
  width?: number;
  height?: number;
  quality?: number;
};

function transform(source: string, opts?: ImgOpts) {
  opts = opts || {};

  const transformations = ["f=webp", `q=${opts.quality || 100}`];

  if (opts) {
    if (opts.height) {
      transformations.push(`h=${opts.height}`);
    }

    if (opts.width) {
      transformations.push(`w=${opts.width}`);
    }
  }

  if (source.startsWith("/")) {
    source = "https://www.puffly.io" + source;
  }

  return `https://www.puffly.io/cdn-cgi/image/${transformations.join(",")}/${encodeURIComponent(source)}`;
}

export default { transform };
