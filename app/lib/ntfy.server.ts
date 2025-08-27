type NTFYOpts = {
  message: string;
  title: string;
  tags?: string;
};

export default async function ntfy(opts: NTFYOpts) {
  const headers: HeadersInit = {
    priority: "5",
  };

  if (opts.title) {
    headers["Title"] = opts.title;
  }

  if (opts.tags) {
    headers["Tags"] = opts.tags;
  }

  await fetch("https://ntfy.sh/puffly_alerts", {
    method: "POST",
    body: opts.message,
    headers,
  });
}
