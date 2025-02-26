import { useQuery, useMutation } from "@tanstack/react-query";
import { ActivityCard } from "@/components/activity-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";
import { Building2, MapPin, Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "@/hooks/use-location";


export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    phone: user?.phone || "",
    village: user?.village || "",
    neighborhood: user?.neighborhood || "",
    anonymousParticipation: user?.anonymousParticipation || false,
  });

  // Dorp/stad zoeken
  const { 
    searchResults: villageResults, 
    isLoading: isVillageLoading, 
    error: villageError,
    searchLocations: searchVillages 
  } = useLocation();
  const [villageSuggestions, setVillageResults] = useState<any[]>([]);

  // Wijken zoeken
  const { 
    searchResults: neighborhoodResults, 
    isLoading: isNeighborhoodLoading, 
    error: neighborhoodError,
    searchLocations: searchNeighborhoods
  } = useLocation();
  const [neighborhoodSuggestions, setNeighborhoodResults] = useState<any[]>([]);

  // Dorpen zoeken
  const { 
    searchResults: villageSearchResults, 
    isLoading: isVillageLoading, 
    error: villageError,
    searchLocations: searchVillages
  } = useLocation();
  const [villageSuggestions, setVillageResults] = useState<any[]>([]);

  // Update suggestions when results change
  useEffect(() => {
    setVillageResults(villageSearchResults || []);
  }, [villageSearchResults]);

  useEffect(() => {
    setNeighborhoodResults(neighborhoodResults || []);
  }, [neighborhoodResults]);

  // Start search functions with appropriate types
  const searchVillagesHandler = (query: string) => {
    searchVillages(query, 'village');
  };

  const searchNeighborhoodsHandler = (query: string) => {
    searchNeighborhoods(query, 'neighborhood');
  };

  const { data: myActivities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/users/${user?.id}/activities`],
    enabled: !!user,
  });

  const updateAnonymous = useMutation({
    mutationFn: async (anonymous: boolean) => {
      if (!user) return;
      await apiRequest("PATCH", `/api/users/${user.id}`, {
        anonymousParticipation: anonymous,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Instellingen bijgewerkt",
        description: "Uw privacy-voorkeuren zijn opgeslagen.",
      });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) return;
      await apiRequest("PATCH", `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
      toast({
        title: "Profiel bijgewerkt",
        description: "Uw profielgegevens zijn opgeslagen.",
      });
    },
  });

  const handleEditClick = () => {
    if (user) {
      setFormData({
        displayName: user.displayName,
        phone: user.phone,
        village: user.village,
        neighborhood: user.neighborhood,
        anonymousParticipation: user.anonymousParticipation
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (!user) return null;

  if (isLoadingActivities) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="text-2xl font-bold">Mijn Profiel</CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Mijn Activiteiten</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between text-2xl font-bold">
          <span>Mijn Profiel</span>
          {!isEditing ? (
            <Button variant="outline" size="icon" onClick={handleEditClick}>
              <Edit className="h-4 w-4" />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-lg font-medium">Naam</label>
                  <p className="text-xl">{user.displayName}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <label className="text-lg font-medium">Locatie</label>
                    <p className="text-xl">{user.village}, {user.neighborhood}</p>
                  </div>
                </div>

                <div>
                  <label className="text-lg font-medium">Telefoonnummer</label>
                  <p className="text-xl">{user.phone}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Naam</Label>
                  <Input 
                    id="displayName" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoonnummer</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Gemeente</Label>
                  <Input 
                    id="village" 
                    value={formData.village}
                    onChange={(e) => {
                      setFormData({...formData, village: e.target.value});
                      searchVillagesHandler(e.target.value);
                    }}
                    list="village-list"
                    required
                  />
                  <datalist id="village-list">
                    {villageSuggestions.map((suggestion:any) => (
                      <option key={suggestion.place_id} value={suggestion.display_name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Wijk</Label>
                  <Input 
                    id="neighborhood" 
                    value={formData.neighborhood}
                    onChange={(e) => {
                      setFormData({...formData, neighborhood: e.target.value});
                      searchNeighborhoodsHandler(e.target.value);
                    }}
                    list="neighborhood-list"
                    required
                  />
                  <datalist id="neighborhood-list">
                    {neighborhoodSuggestions.map((suggestion:any) => (
                      <option key={suggestion.place_id} value={suggestion.display_name} />
                    ))}
                  </datalist>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Bezig..." : "Opslaan"}
                    {!updateProfile.isPending && <Save className="ml-2 h-4 w-4" />}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Annuleren
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={user.anonymousParticipation}
                onCheckedChange={(checked) => {
                  updateAnonymous.mutate(checked as boolean);
                }}
              />
              <label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Anoniem deelnemen aan activiteiten
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Mijn Activiteiten</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {myActivities?.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isRegistered={true}
              onRegister={() => {}}
            />
          ))}
          {(!myActivities || myActivities.length === 0) && (
            <p className="col-span-2 text-center text-lg text-muted-foreground">
              U bent nog niet aangemeld voor activiteiten
            </p>
          )}
        </div>
      </div>
    </div>
  );
}