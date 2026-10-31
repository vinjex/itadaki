// Sections are runs of consecutive items sharing a `section` name. These pure
// functions let the editor treat them as movable blocks without changing the data.

export function groups(items) {
  const result = [];
  items.forEach((item, index) => {
    const section = item.section || null;
    const last = result[result.length - 1];
    if (last && last.section === section) last.end = index;
    else result.push({ section, start: index, end: index });
  });
  return result;
}

export function renameGroup(items, group, name) {
  const section = name.trim() || null;
  return items.map((item, i) => (i >= group.start && i <= group.end ? { ...item, section } : item));
}

// Moving past the edge of a block joins the neighbouring block instead of swapping,
// which is how an item changes section.
export function move(items, index, direction) {
  const all = groups(items);
  const g = all.find((x) => index >= x.start && index <= x.end);
  const atEdge = direction < 0 ? index === g.start : index === g.end;
  const neighbour = all[all.indexOf(g) + direction];
  if (atEdge) {
    if (!neighbour) return items;
    return items.map((item, i) => (i === index ? { ...item, section: neighbour.section } : item));
  }
  const copy = [...items];
  [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]];
  return copy;
}

export function insertInGroup(items, group, item) {
  const copy = [...items];
  copy.splice(group.end + 1, 0, { ...item, section: group.section });
  return copy;
}

// Moves the item at `fromOffset` of block `fromBlock` to `toOffset` of block `toBlock`,
// taking on that block's section: what a drag and drop does. Blocks left empty vanish.
export function relocate(items, fromBlock, fromOffset, toBlock, toOffset) {
  const blocks = groups(items).map((g) => ({ section: g.section, items: items.slice(g.start, g.end + 1) }));
  const [item] = blocks[fromBlock].items.splice(fromOffset, 1);
  blocks[toBlock].items.splice(toOffset, 0, item);
  return blocks.flatMap((b) => b.items.map((i) => ({ ...i, section: b.section })));
}

// Turns a step that is really a heading ("For the sauce") into the section of the
// steps after it, up to the next section change.
export function promoteToHeading(items, index) {
  const name = items[index].text.trim().replace(/[:：]$/, "");
  const rest = items.filter((_, i) => i !== index);
  const block = groups(rest).find((g) => index >= g.start && index <= g.end);
  if (!block) return rest;
  return rest.map((item, i) => (i >= index && i <= block.end ? { ...item, section: name } : item));
}

// Undoes promoteToHeading: the heading becomes a step again at the top of its block,
// and the block rejoins the section before it.
export function demoteHeading(items, group) {
  const before = groups(items).find((g) => g.end === group.start - 1);
  const section = before ? before.section : null;
  const step = { text: group.section, section };
  const regrouped = items.map((item, i) => (i >= group.start && i <= group.end ? { ...item, section } : item));
  regrouped.splice(group.start, 0, step);
  return regrouped;
}
