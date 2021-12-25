
# webmc

![img](./example.png)

After decompiling and deobfuscating Minecraft java 1.14.4,<br/>
I realized it would be easier to recreate instead of mod.<br/>
This is the result of that realization.

## Libraries
- three and @types/three for base webgl renderer

# In House Libraries
- @repcomm/gameinput-ts for dynamic user input
- @repcomm/three.lookcamera for demo freecamera
- @repcomm/exponent-ts for UI library

## Implemented
- WebGL renderer
- World - renders chunks
- Chunk - renders blocks
- Block - accesses block data from chunks
- AtlasBuilder - generate texture atlas / uvs / block mappings automagically from individual block face pngs
- Atlas - single material/texture and block UVs mappings for rendering
