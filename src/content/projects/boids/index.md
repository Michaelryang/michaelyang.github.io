---
title: "Boids"
summary: "Emergent behavior in flocking simulations"
date: "September 19 2024"
draft: false
tags:
- Boids
- Unreal Engine 5
- C++
# demoUrl: https://astro-sphere-demo.vercel.app
# repoUrl: https://github.com/markhorn-dev/astro-sphere
---

## Boids: Let's Make An Aquarium

<div style="display: flex; justify-content: center;">
<iframe width="560" height="315" src="https://www.youtube.com/embed/2HqwvY6W1so?si=MLd_9JqM1p0CI_tG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Boids is an artificial life program that was developed by Craig Reynolds in 1986. It is an example of emergent behavior, where complex behaviors come from relatively simple rules. I've always been a fan of emergent gameplay and behavior, which led to this particular investigation, among many others. In this post, I will briefly go over some of the things I worked on in this project.

### The fundamentals of the boids algorithm
There are plenty of places where the algorithm is described, so instead of repeating this information, I suggest checking out [this source](https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html), which also has a link to [sample pseudocode](https://vergenet.net/~conrad/boids/pseudocode.html). There are some differences in this implementation and mine, but the overall idea is there.

I began by implementing the core rules in **Unreal Engine 5** with mainly **C++**. Below are the code snippets for separation, alignment, and cohesion headings:

```cpp
FVector ABoid::CalculateSeparationHeading(TArray<TObjectPtr<ABoid>>& Neighbors)
{
	FVector AveragePosition = FVector::Zero();

	for (int x = 0; x < Neighbors.Num(); ++x)
	{
		AveragePosition += GetActorLocation() - Neighbors[x]->GetActorLocation();
	}

	return AveragePosition * BoidManager->SeparationFactor;
}


FVector ABoid::CalculateAlignmentHeading(TArray<TObjectPtr<ABoid>>& Neighbors)
{
	FVector AverageVelocity = FVector::Zero();

	for (int x = 0; x < Neighbors.Num(); ++x)
	{
		AverageVelocity += Neighbors[x]->Velocity;
	}

	if (Neighbors.Num() > 0)
	{
		AverageVelocity /= Neighbors.Num();
	}

	return (AverageVelocity - Velocity) * BoidManager->AlignFactor;
}

FVector ABoid::CalculateCohesionHeading(TArray<TObjectPtr<ABoid>>& Neighbors)
{
	FVector AveragePosition = FVector::Zero();

	for (int x = 0; x < Neighbors.Num(); ++x)
	{
		AveragePosition += Neighbors[x]->GetActorLocation();
	}

	if (Neighbors.Num() > 0)
	{
		AveragePosition /= Neighbors.Num();
		return (AveragePosition - GetActorLocation()) * BoidManager->CohesionFactor;
	}

	return FVector::Zero();
}
```

Each returned heading is multiplied by a `SeparationFactor`, `AlignFactor`, and `CohesionFactor` respectively. This allows us to tune the weights according to our needs - for example, setting `AlignFactor = 0.0` eliminates the behavior entirely, which is useful to create flocking behavior more reminiscent of swarming bugs. These forces are added to the boid's velocity, and then clamped to a maximum/minimum speed. Additionally, we choose different radii for each behavior - generally, a lower separation radius and higher cohesion/alignment radius gives the smoothest and most realistic results.

Below are clips of the three rules displayed independently of each other, just for a quick visual of what is happening.

1. Separation (boids move away from other boids that are too close):
<div style="display: flex; justify-content: center;">
<iframe width="560" height="315" src="https://www.youtube.com/embed/KVpSk3aA9f8?si=_gn5o_Mhvvx07FJc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

2. Alignment (boids move in the same direction as other boids):
<div style="display: flex; justify-content: center;">
<iframe width="560" height="315" src="https://www.youtube.com/embed/r5oYXo483Ec?si=SEoTv-fhYSvd_FOR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

3. Cohesion (boids move towards the center/average location of the flock):
<div style="display: flex; justify-content: center;">
<iframe width="560" height="315" src="https://www.youtube.com/embed/_j3aul1lbTc?si=atEKvIULIzzSg2Jx" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

### Obstacle Avoidance
With the basics implemented, the next step is obstacle avoidance. Essentially, each boid raycasts in the forward direction. If an obstacle is hit, then we continue raycasting in larger and larger angles from the boid's forward direction until a clear path is found (or, if all raycasts were blocked, the furthest distance-to-obstacle found).

Before this is possible, we need a way to generate the directions we need to raycast, which are ideally spread out evenly over a sphere. This is problem known as "packing points on a sphere". I found this [stackoverflow post](https://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere/44164075#44164075) which described different methods to compute the points. I do not fully understand the math, but this is the code I used to generate my points:

```cpp
void ABoidManager::ComputeAvoidanceRays()
{
	float GoldenRatio = (1 + FMath::Sqrt(5.0)) / 2;
	float AngleIncrement = PI * 2 * GoldenRatio;

	for (int x = 0; x < NumAvoidancePoints; x++) 
	{
		float t = (float)x / NumAvoidancePoints;
		float inclination = FMath::Acos(1 - 2 * t);
		float azimuth = AngleIncrement * x;

		float X = FMath::Sin(inclination) * FMath::Cos(azimuth);
		float Y = FMath::Sin(inclination) * FMath::Sin(azimuth);
		float Z = FMath::Cos(inclination);
		FRotator Rotator = FRotator(-90.0, 0, 0);
		
		AvoidanceRays.Add(Rotator.RotateVector(FVector(X, Y, Z)));
	}
}
```
The array of points also has the very useful property that it "spirals" out from the first point, which is perfect for our use case. We now have a set of directions in local space that we can use for obstacle avoidance. By also defining a maximum view angle, we achieve the following result:

![Obstacle Rays](/project-3-boids/obstaclerays.png)

One important thing to note is that the rays are in local space to a point without any transforms. In order to be used by the boids, you must rotate the rays to match the boid's rotation.

```cpp
FVector ABoid::CalculateObstacleAvoidance()
{
	TArray<FVector> Rays = BoidManager->GetAvoidanceRays();

	FHitResult HitResult;
	float FurthestUnobstructedDistance = 0.0f;
	FVector BestDirection = GetActorForwardVector();

	ETraceTypeQuery TraceChannel = UEngineTypes::ConvertToTraceType(ECollisionChannel::ECC_GameTraceChannel1);
	EDrawDebugTrace::Type DebugTraceType = EDrawDebugTrace::Type::None;
	TArray<AActor*> ActorsToIgnore;

	for (int x = 0; x < Rays.Num(); ++x)
	{
		FVector WorldSpaceRay = GetTransform().GetRotation().RotateVector(Rays[x]);
		float Angle = FMath::Acos(FVector::DotProduct(WorldSpaceRay, GetActorForwardVector()));

		if (FMath::RadiansToDegrees(Angle) < BoidManager->ViewAngle)
		{
			bool TraceHit = UKismetSystemLibrary::SphereTraceSingle(GetWorld(), GetActorLocation(), GetActorLocation() + WorldSpaceRay * BoidManager->AvoidanceViewDistance,
				50.0, TraceChannel, true, ActorsToIgnore, DebugTraceType, HitResult, true);

			if (TraceHit)
			{
				if (HitResult.Distance > FurthestUnobstructedDistance)
				{
					BestDirection = WorldSpaceRay;
					FurthestUnobstructedDistance = HitResult.Distance;
				}
			}
			else
			{
				return WorldSpaceRay * BoidManager->MaxSpeed * BoidManager->ObstacleAvoidanceFactor;
			}
		}
	}
	return BestDirection * BoidManager->MaxSpeed * BoidManager->ObstacleAvoidanceFactor;
}
```

Two important things to note: 
1. **This implementation exits as soon as a raycast doesn't hit an obstacle.** Because of this, the boids are "blind" to objects like walls if they are swimming parallel to them. If more "awareness" is required, you can set a minimum view angle that must be iterated through before exiting.
2. **The avoidance force does not scale with proximity.** Typically, as you get closer to a brick wall, you are increasingly less willing to walk into it. For a stronger reaction to approaching obstacles, you may consider scaling the magnitude of the returned vector with proximity to an object.

A less important third thing is that I used a SphereCast instead of a raycast to deal with issue number 1. This is probably not as robust as making the changes mentioned above, However, by inspection, I think the boids are doing good enough for me!

### Next steps
Currently the boids iterate through the entire list of boids in the level to determine their nearby neighbors, which is polynomial time. The most important optimization by far is to create a quadtree, or split up the bounds space some other way to minimize the amount of computation required to get each boid's neighbors.

In addition, since boids calculate their headings independently of each other, this simulation is a perfect candidate for a compute shader to parallelize computation on the GPU.

Finally, a donut and cubes are hardly the most interesting obstacles for our boids. Procedurally generated terrain can be used as a much more rigorous test for our boids' obstacle avoidance and navigation. The next update to this project will likely contain all of these improvements. So until next time, thanks for reading.