interface SavedLocation {
  name: string;
  latlng: { lat: number; lng: number };
}

export async function saveLocations(locations: SavedLocation[]): Promise<void> {
  const savePromises = locations.map(async (loc) => {
    await prisma.location.create({
      data: {
        name: loc.name,
        lat: loc.latlng.lat,
        lng: loc.latlng.lng,
      },
    });
  });

  await Promise.all(savePromises);
}

export async function loadLocations(): Promise<SavedLocation[]> {
  const dbLocations = await prisma.location.findMany();
  return dbLocations.map((loc: { name: string; lat: number; lng: number; }) => ({
    name: loc.name,
    latlng: { lat: loc.lat, lng: loc.lng },
  }));
}
