import { Link } from "react-router-dom";
import { fraudCategories } from "@/data/fraudCategories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Zap, Target, Search } from "lucide-react";

export const FraudCoverage = () => {
    return (
        <div className="container px-4 py-12 max-w-7xl mx-auto space-y-12 animate-fade-in">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <Badge variant="outline" className="px-4 py-1 border-primary/50 text-primary animate-pulse">
                    Comprehensive Coverage
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Fraud & Scam Coverage
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    S.A.F.E. uses 5 specialized AI engines to detect 40+ fraud types across multiple vectors in real-time.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fraudCategories.map((category) => (
                    <Card key={category.id} className="group relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <Shield className="h-24 w-24" />
                        </div>

                        <CardHeader>
                            <div className="mb-4 inline-flex items-center justify-center p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                <Shield className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-2xl font-bold">{category.name}</CardTitle>
                            <CardDescription className="line-clamp-2 text-muted-foreground/80 italic">
                                {category.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className="bg-primary/5 text-primary-foreground/90 border-primary/20 flex items-center gap-1">
                                    <Zap className="h-3 w-3" /> {category.detectionType}
                                </Badge>
                                <Badge variant="outline" className="border-white/10 flex items-center gap-1">
                                    <Target className="h-3 w-3" /> {category.detectionApproach}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-white/50 mb-2 flex items-center gap-2">
                                    <Search className="h-4 w-4" /> Detection Scope:
                                </p>
                                <ul className="grid grid-cols-1 gap-1">
                                    {category.supportedTypes.slice(0, 3).map((type, i) => (
                                        <li key={i} className="text-sm text-foreground/70 flex items-center gap-2">
                                            <span className="h-1 w-1 rounded-full bg-primary/50" />
                                            {type}
                                        </li>
                                    ))}
                                    {category.supportedTypes.length > 3 && (
                                        <li className="text-sm text-primary font-medium italic mt-1">
                                            + {category.supportedTypes.length - 3} more types...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-4 border-t border-white/5">
                            <Button asChild variant="ghost" className="w-full group/btn hover:bg-primary/10 hover:text-primary transition-all">
                                <Link to={`/fraud-coverage/${category.id}`} className="flex items-center justify-between w-full">
                                    Explore Capabilities
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default FraudCoverage;
