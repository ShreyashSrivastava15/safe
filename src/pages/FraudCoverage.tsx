import { Link } from "react-router-dom";
import { fraudCategories } from "@/data/fraudCategories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Zap, Target, Search, Mail, MessageSquare, Link2, ShoppingCart, CreditCard } from "lucide-react";

export const FraudCoverage = () => {
    const getIcon = (iconName: string | undefined) => {
        switch (iconName) {
            case 'Mail': return <Mail className="h-6 w-6" />;
            case 'MessageSquare': return <MessageSquare className="h-6 w-6" />;
            case 'Link2': return <Link2 className="h-6 w-6" />;
            case 'ShoppingCart': return <ShoppingCart className="h-6 w-6" />;
            case 'CreditCard': return <CreditCard className="h-6 w-6" />;
            default: return <Shield className="h-6 w-6" />;
        }
    };

    const getColors = (id: string) => {
        switch (id) {
            case 'email-communication': return 'from-blue-500/20 text-blue-400 border-blue-500/30';
            case 'message-based': return 'from-green-500/20 text-green-400 border-green-500/30';
            case 'phishing-urls': return 'from-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'e-commerce': return 'from-purple-500/20 text-purple-400 border-purple-500/30';
            case 'financial-transactions': return 'from-red-500/20 text-red-400 border-red-500/30';
            default: return 'from-primary/20 text-primary border-primary/30';
        }
    };

    return (
        <div className="container px-4 py-12 max-w-7xl mx-auto space-y-12 animate-fade-in">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <Badge variant="outline" className="px-4 py-1 border-primary/50 text-primary animate-pulse">
                    Global Threat Intelligence
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Detection <span className="text-primary italic">Capabilities</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    S.A.F.E. orchestrates specialized AI engines to monitor vectors for high-sophistication fraudulent intent.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fraudCategories.map((category) => {
                    const colorClasses = getColors(category.id);
                    return (
                        <Card key={category.id} className="group relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]">
                            {/* Decorative background glow */}
                            <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br transition-all duration-700 group-hover:scale-150 opacity-10 group-hover:opacity-20 blur-3xl ${colorClasses.split(' ')[0]}`} />

                            <CardHeader>
                                <div className={`mb-4 inline-flex items-center justify-center p-3 rounded-xl bg-white/5 border transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-black ${colorClasses.split(' ').slice(1).join(' ')}`}>
                                    {getIcon(category.icon)}
                                </div>
                                <CardTitle className="text-2xl font-bold">{category.name}</CardTitle>
                                <CardDescription className="text-muted-foreground/90 min-h-[40px]">
                                    {category.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-wider font-bold">
                                        {category.detectionType}
                                    </Badge>
                                    <Badge variant="outline" className="border-white/10 text-[10px] uppercase font-medium flex items-center gap-1">
                                        <Zap className="h-2 w-2 text-primary" /> {category.detectionApproach}
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                                        <Target className="h-3 w-3" /> Coverage Matrix:
                                    </p>
                                    <ul className="grid grid-cols-1 gap-2">
                                        {category.supportedTypes.slice(0, 3).map((type, i) => (
                                            <li key={i} className="text-sm text-foreground/80 flex items-center gap-2 group/line">
                                                <div className="h-1 w-1 rounded-full bg-primary/40 group-hover/line:bg-primary group-hover/line:scale-150 transition-all" />
                                                {type}
                                            </li>
                                        ))}
                                        {category.supportedTypes.length > 3 && (
                                            <li className="text-xs text-primary/70 font-semibold italic mt-1 ml-3">
                                                + {category.supportedTypes.length - 3} additional vectors
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-4 border-t border-white/5">
                                <Button asChild variant="ghost" className="w-full group/btn hover:bg-white/5 hover:text-primary transition-all rounded-xl">
                                    <Link to={`/fraud-coverage/${category.id}`} className="flex items-center justify-between w-full">
                                        <span className="font-semibold">Deep Dive Capabilities</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default FraudCoverage;
