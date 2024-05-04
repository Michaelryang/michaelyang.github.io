---
title: "DirectX 12: Basic Graphics Concepts"
summary: "Preliminary knowledge to set up your first DirectX program"
date: "May 3 2024"
draft: false
tags:
- Graphics
- DirectX
---

Admittedly, I mostly skimmed through the chapters on Matrices and Transformations, since the math makes my head spin - no post about that for now. In Chapter 4 of **3D Game Programming with DirectX 12** by Frank Luna, we finally get an overview of the basic concept requirements to begin initializing a DirectX program.

### Overview
Direct3D is a low-level graphics API. Instead of having to directly send machine instructions to the GPU, we call Direct3D methods so that the API talks to the GPU for us. The main improvement of DirectX 12 over previous versions is its improved multi-threading support. Of course, that also makes using it more difficult.

### Component Object Model (COM)
COMs allows DirectX to be programming-language independent.
- Their implementation is mostly hidden. We should think of them as C++ class interfaces.
- COM objects are reference counted, meaning they are garbage collected when all references to the object go out of scope.
- We have the `ComPtr` class to manage the lifetime of COM objects.

Short code example:
```cpp
ComPtr<ID3D12RootSignature> mRootSignature;
mCommandList->SetGraphicsRootSignature(mRootSignature.Get());

...

ComPtr<ID3D12CommandAllocator> mDirectCmdListAlloc;
ThrowIfFailed(md3dDevice->CreateCommandAllocator(D3D12_COMMAND_LIST_TYPE_DIRECT, mDirectCmdListAlloc.GetAddressOf()));
```

### Texture Formats
Textures, while normally thought of as storing image data, are really just 1D, 2D, or 3D arrays of data elements (for now). They can only store certain types of data elements - some examples are below:
1. `DXGI_FORMAT_R32G32B32_FLOAT`: Each element has three 32-bit floating-point components.
2. `DXGI_FORMAT_R32G32_UINT`: two 32-bit uint components.
3. `DXGI_FORMAT_R8G8B8A8_UINT`: four 8-bit uint components in the [0, 255] range.

There are also typeless formats that just reserves memory until later interpretation of the data.

### The Swap Chain
To prevent flickering or other artifacts on the screen, two textures are maintained, called the _front buffer_ and the _back buffer_. The front buffer contains the current displayed image, and the back buffer contains the next frame to be displayed. After the frame is completely drawn, pointers to the two are swapped, so the front becomes the back and vice versa (this is called _presenting_). The buffers thus form a **swap chain**.

### Depth Buffering (Also known as Z-Buffering)
For each pixel on the screen, how do we know which object should be drawn? The computer must determine the closest surface to the camera and proceed accordingly. The values for the texture range from 0.0 to 1.0 (closest to furthest), initialized at 1.0. As objects are rendered, the depth value is updated if the object's depth is closer than the current depth value in the depth buffer (as well as the specified pixel in the back buffer). This ensures that by at the end when all objects are drawn, the pixel with the closest depth value is the one in the back buffer and therefore destined for the screen.

Here is a picture representations from wikipedia:
![zbuffer](/04-DirectX-BasicConcepts/zbuffer.png)

### Multisampling Theory
Because pixels don't create infinite detail, steps should be taken to handle aliasing. For example, supersampling uses a 4X larger back buffer, and resolving blocks of 4 subpixels to an average color. This is expensive. DirectX supports multisampling, which instead of computing the image color of each subpixel, it computes it only once per pixel at the pixel center.

### The Command Queue and Command Lists
The GPU has a _command queue_ that the CPU submits to via _command lists_. The GPU works through the command queue, so commands are usually not immediately acted on - the CPU and GPU work in parallel. In DirectX you add commands to the command list before closing it and then handing it off to the command queue. Associated with a command list is a memory backing class called a _command allocator_. The commands are stored in the allocator, and the command queue will reference those.

### CPU/GPU Synchronization
To ensure that the CPU doesn't, for example, overwrite data of a resource that the GPU is currently trying to render, we can implement a _fence_ that forces the CPU to wait until the GPU is finished up to the specified fence point. A fence object maintains a UINT64 value to identify points in time.

### Resource Transitions
Resources are assigned states by DirectX to prevent resource hazards from occuring - such as the GPU reading from a resource it has not finished writing to. For example, the resource is set to a render target state when the GPU writes to it, and cannot be read from until the state changes. A resource transition is specified by an array of transition resource barriers on the command list.