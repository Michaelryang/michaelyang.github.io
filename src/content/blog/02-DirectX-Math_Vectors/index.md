---
title: "3D Game Programming with DirectX 12: 1.6 DirectX Math Vectors and Matrices"
summary: "A summary of SIMD Instructions and XMVectors/XMMatrices in DirectX"
date: "April 28 2024"
draft: false
tags:
- Graphics
- DirectX
- Vectors
- Matrices
---

In chapter 1 of **3D Game Programming with DirectX 12** by Frank Luna, there is a brief overview of some vector basics, followed by an overview of the ``DirectXMath.h`` math library. This uses the "SSE2" instruction set (Streaming SIMD Extensions 2), which introduces double-precision floating point instructions. What's important to know here is that 128-bit wide SIMD (single instruction multiple data) instructions can do things to _four_ 32-bit ``floats`` or ``ints` with _one_ instruction.

Naturally, this is terrific for vector calculations; for example, we can perform vector addition with one SIMD instruction instead of four scalar instructions. Note that we can just ignore coordinates if our vectors have less than 4 dimensions.

---

What does this look like in code? In summary:
- The core vector type in DirectX Math is ``XMVECTOR``.
- ``XMVECTOR`` must be 16-byte aligned, so for class data members, we use `XMFLOAT2`, `XMFLOAT3`, `XMFLOAT4`.
- To make use of SIMD, we use loading functions to convert from `XMFLOATn` to `XMVECTOR` whenever we need to do calculations.

- As parameters, we can pass `XMVECTOR` values in SSE2 registers instead of on the stack. Because of differences in platforms and compilers, passing vectors looks like this:
    1. The first three `XMVECTOR` parameters should be `FXMVECTOR`
    2. The fourth should be `GXMVECTOR`
    3. The fifth and sixth: `HXMVECTOR`
    4. Any further parameters: `CXMVECTOR`
- Use `XM_CALLCONV` to use the proper calling convention.
- For constructors, it's `FXMVECTOR` for the first three, and `CXMVECTOR` for the rest. Constructors don't use the `XM_CALLCONV` annotation.
- Constant `XMVECTOR` instances should use `XMVECTORF32`, or `XMVECTORU32` for integer data.

It is not yet explained clearly why the parameter passing is so strange, so hopefully it's covered eventually. The book then details setter functions and vector functions, which I won't list out here. However - it is interesting to note that functions that should usually produce scalar output (such as the dot product) actually still return `XMVECTOR`s, preventing mixing up scalar and SIMD vector operations for efficiency.

Here's a short program that demonstrates some of the functions for vector math.
```cpp
#include <windows.h>
#include <DirectXMath.h>
#include <DirectXPackedVector.h>
#include <iomanip>
#include <iostream>

using namespace std;
using namespace DirectX;
using namespace DirectX::PackedVector;

ostream& XM_CALLCONV operator<<(ostream&os, FXMVECTOR v)
{
	XMFLOAT3 dest;
	XMStoreFloat3(&dest, v);

	os << "(" << dest.x << ", " << dest.y << ", " << dest.z << ")";
	return os;
}

int main()
{
	cout.setf(ios_base::boolalpha);

	//Check support for SSE2
	if (!XMVerifyCPUSupport())
	{
		cout << "directx math not supported " << endl;
		return 0;
	}

	XMVECTOR n = XMVectorSet(1.0f, 0.0f, 0.0f, 0.0f);
	XMVECTOR u = XMVectorSet(1.0, 2.0f, 3.0f, 0.0f);
	XMVECTOR v = XMVectorSet(-2.0f, 1.0f, -3.0f, 0.0f);
	XMVECTOR w = XMVectorSet(0.707f, 0.707f, 0.0f, 0.0f);

	// vector math
	XMVECTOR a = u + v;
	XMVECTOR b = u - v;
	XMVECTOR c = 10.0f * u;

	// ||u||
	XMVECTOR L = XMVector3Length(u);

	// u/||u||
	XMVECTOR d = XMVector3Normalize(u);

	// u dot v
	XMVECTOR s = XMVector3Dot(u, v);

	// u x v
	XMVECTOR e = XMVector3Cross(u, v);

	XMVECTOR projW;
	XMVECTOR perpW;
	XMVector3ComponentsFromNormal(&projW, &perpW, w, n);

	bool equal = XMVector3Equal(projW + perpW, w) != 0;
	bool notEqual = XMVector3NotEqual(projW + perpW, w) != 0;

	XMVECTOR angleVec = XMVector3AngleBetweenVectors(projW, perpW);
	float angleRadians = XMVectorGetX(angleVec);
	float angleDegrees = XMConvertToDegrees(angleRadians);

	cout << left << setfill(' ') << setw(20) << "u" << right << setfill(' ') << setw(20) << "= " << u << endl;
	cout << left << setfill(' ') << setw(20) << "v" << right << setfill(' ') << setw(20) << "= " << v << endl;
	cout << left << setfill(' ') << setw(20) << "w" << right << setfill(' ') << setw(20) << "= " << w << endl;
	cout << left << setfill(' ') << setw(20) << "n" << right << setfill(' ') << setw(20) << "= " << n << endl;
	cout << left << setfill(' ') << setw(20) << "a = u + v" << right << setfill(' ') << setw(20) << "= " << a << endl;
	cout << left << setfill(' ') << setw(20) << "b = u - v" << right << setfill(' ') << setw(20) << "= " << b << endl;
	cout << left << setfill(' ') << setw(20) << "c = 10 * u" << right << setfill(' ') << setw(20) << "= " << c << endl;
	cout << left << setfill(' ') << setw(20) << "d = u / ||u||" << right << setfill(' ') << setw(20) << "= " << d << endl;
	cout << left << setfill(' ') << setw(20) << "e = u x v" << right << setfill(' ') << setw(20) << "= " << e << endl;
	cout << left << setfill(' ') << setw(20) << "L = ||u||" << right << setfill(' ') << setw(20) << "= " << L << endl;
	cout << left << setfill(' ') << setw(20) << "s = u.v" << right << setfill(' ') << setw(20) << "= " << s << endl;
	cout << left << setfill(' ') << setw(20) << "projW" << right << setfill(' ') << setw(20) << "= " << projW << endl;
	cout << left << setfill(' ') << setw(20) << "perpW" << right << setfill(' ') << setw(20) << "= " << perpW << endl;
	cout << left << setfill(' ') << setw(20) << "projW + perpW == w" << right << setfill(' ') << setw(20) << "= " << equal << endl;
	cout << left << setfill(' ') << setw(20) << "projW + perpW != w" << right << setfill(' ') << setw(20) << "= " << notEqual << endl;
	cout << left << setfill(' ') << setw(20) << "angle" << right << setfill(' ') << setw(20) << "= " << angleDegrees << endl;

	return 0;
}
```
And the output:
```
u                                     = (1, 2, 3)
v                                     = (-2, 1, -3)
w                                     = (0.707, 0.707, 0)
n                                     = (1, 0, 0)
a = u + v                             = (-1, 3, 0)
b = u - v                             = (3, 1, 6)
c = 10 * u                            = (10, 20, 30)
d = u / ||u||                         = (0.267261, 0.534522, 0.801784)
e = u x v                             = (-9, -3, 5)
L = ||u||                             = (3.74166, 3.74166, 3.74166)
s = u.v                               = (-9, -9, -9)
projW                                 = (0.707, 0, 0)
perpW                                 = (0, 0.707, 0)
projW + perpW == w                    = true
projW + perpW != w                    = false
angle                                 = 90
```

We also have the `XMMATRIX` type with its own conventions. For class data members, we use `XMFLOAT4X4`. When passing a matrix as a parameter, one matrix counts as four `XMVECTOR` parameters. So, the first `XMMATRIX` is of type `FXMMATRIX`, and subsequent parameters are of type `CXMMATRIX`. DirectX Math also recommends using `CXMMATRIX` for constructors that takes `XMMATRIX` parameters. Sample program below:

```cpp
#include <windows.h>
#include <DirectXMath.h>
#include <DirectXPackedVector.h>
#include <iostream>

using namespace std;
using namespace DirectX;
using namespace DirectX::PackedVector;

// overload "<<"
ostream& XM_CALLCONV operator<<(ostream& os, FXMVECTOR v)
{
	XMFLOAT4 dest;
	XMStoreFloat4(&dest, v);

	os << "(" << dest.x << ", " << dest.y << ", " << dest.z << ", " << dest.w << ")";
	return os;
}

ostream& XM_CALLCONV operator<<(ostream& os, FXMMATRIX m)
{
	for ( int x = 0; x < 4; ++x )
	{
		os << XMVectorGetX(m.r[x]) << "\t";
		os << XMVectorGetY(m.r[x]) << "\t";
		os << XMVectorGetZ(m.r[x]) << "\t";
		os << XMVectorGetW(m.r[x]) << "\t";
		os << endl;
	}

	return os;
}

int main()
{
	if (!XMVerifyCPUSupport())
	{
		cout << "directx math not supported" << endl;
		return 0;
	}

	XMMATRIX A(1.0f, 0.0f, 0.0f, 0.0f,
		0.0f, 2.0f, 0.0f, 0.0f,
		0.0f, 0.0f, 4.0f, 0.0f,
		1.0f, 2.0f, 3.0f, 1.0f);

	XMMATRIX B = XMMatrixIdentity();

	XMMATRIX C = A * B;

	XMMATRIX D = XMMatrixTranspose(A);

	XMVECTOR det = XMMatrixDeterminant(A);
	XMMATRIX E = XMMatrixInverse(&det, A);

	XMMATRIX F = A * E;

	cout << "A = " << endl << A << endl;
	cout << "B = " << endl << B << endl;
	cout << "C = A*B =" << endl << C << endl;
	cout << "D = transpose(A) = " << endl << D << endl;
	cout << "det = determinant(A) = " << det << endl << endl;
	cout << "E = inverse(A)" << endl << E << endl;
	cout << "F = A*E" << endl << F << endl;
}
```
And the output:
```
A =
1       0       0       0
0       2       0       0
0       0       4       0
1       2       3       1

B =
1       0       0       0
0       1       0       0
0       0       1       0
0       0       0       1

C = A*B =
1       0       0       0
0       2       0       0
0       0       4       0
1       2       3       1

D = transpose(A) =
1       0       0       1
0       2       0       2
0       0       4       3
0       0       0       1

det = determinant(A) = (8, 8, 8, 8)

E = inverse(A)
1       0       0       0
0       0.5     0       0
0       0       0.25    0
-1      -1      -0.75   1

F = A*E
1       0       0       0
0       1       0       0
0       0       1       0
0       0       0       1
```
