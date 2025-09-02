type ImgOpts = {
  width?: number;
  height?: number;
};

function transform(source: string, opts?: ImgOpts) {
  const transformations = ["f=webp", "q=100"];

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

  return `https://www.puffly.io/cdn-cgi/image/${transformations.join(",")}/${source}`;
}

export default { transform };
