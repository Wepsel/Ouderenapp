import { useState, useEffect } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "@/hooks/use-location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  username: z.string().min(1, "Gebruikersnaam is verplicht"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
});

const registerSchema = loginSchema.extend({
  displayName: z.string().min(1, "Naam is verplicht"),
  phone: z.string().min(1, "Telefoonnummer is verplicht"),
  village: z.string().min(1, "Dorp is verplicht"),
  neighborhood: z.string().min(1, "Wijk is verplicht"),
  anonymousParticipation: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useWouterLocation();
  const { user, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Dorp/stad zoeken
  const { 
    searchResults: villageSearchResults, 
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
  
  // Update suggestions when results change
  useEffect(() => {
    setVillageResults(villageSearchResults || []);
  }, [villageSearchResults]);
  
  useEffect(() => {
    setNeighborhoodResults(neighborhoodResults);
  }, [neighborhoodResults]);
  
  // Start search functions with appropriate types
  const searchVillagesHandler = (query: string) => {
    searchVillages(query, 'village');
  };
  
  const searchNeighborhoodsHandler = (query: string) => {
    searchNeighborhoods(query, 'neighborhood');
  };

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      phone: "",
      village: "",
      neighborhood: "",
      anonymousParticipation: false,
    },
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const onLogin = async (data: LoginForm) => {
    try {
      await login(data);
      setLocation("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      await register(data);
      setLocation("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Welkom bij het Activiteitencentrum</h1>
            <p className="mt-2 text-xl text-muted-foreground">
              Meld u aan om deel te nemen aan activiteiten en ontmoet andere deelnemers
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Inloggen</TabsTrigger>
                  <TabsTrigger value="register">Registreren</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLogin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gebruikersnaam</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wachtwoord</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {loginForm.formState.isSubmitting ? "Bezig..." : "Inloggen"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegister)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Naam</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gebruikersnaam</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wachtwoord</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefoonnummer</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="village"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Dorp/Stad</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  searchVillagesHandler(e.target.value);
                                }}
                                autoComplete="off"
                              />
                            </FormControl>
                            {villageResults.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                {villageResults.map((village) => (
                                  <div
                                    key={village.id}
                                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                                    onClick={() => {
                                      field.onChange(village.name);
                                      setVillageResults([]);
                                    }}
                                  >
                                    {village.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {isVillageLoading && (
                              <div className="text-sm text-muted-foreground">Dorpen laden...</div>
                            )}
                            {villageError && (
                              <div className="text-sm text-destructive">{villageError}</div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Wijk</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  searchNeighborhoodsHandler(e.target.value);
                                }}
                                autoComplete="off"
                              />
                            </FormControl>
                            {neighborhoodResults.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                {neighborhoodResults.map((neighborhood) => (
                                  <div
                                    key={neighborhood.id}
                                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                                    onClick={() => {
                                      field.onChange(neighborhood.name);
                                      setNeighborhoodResults([]);
                                    }}
                                  >
                                    {neighborhood.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {isNeighborhoodLoading && (
                              <div className="text-sm text-muted-foreground">Wijken laden...</div>
                            )}
                            {neighborhoodError && (
                              <div className="text-sm text-destructive">{neighborhoodError}</div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="anonymousParticipation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Anoniem deelnemen</FormLabel>
                              <FormDescription>
                                Alleen uw dorp en wijk worden getoond bij activiteiten
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? "Bezig..." : "Registreren"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1574871786514-46e1680ea587"
            alt="Senioren die samen activiteiten doen"
            className="h-full w-full rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
}