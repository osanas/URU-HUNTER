import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Demande de suppression des données",
  description: "Instructions pour demander la suppression de vos données - Facebook, Instagram, Twilio, WhatsApp",
}

export default function UserDataDeletionPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "https://votre-domaine.com"

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="mb-2 text-3xl font-bold">Demande de suppression des données</h1>
        <p className="mb-12 text-muted-foreground">
          Conformément au RGPD et aux exigences de Meta (Facebook, Instagram) et Twilio (SMS, WhatsApp).
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Comment demander la suppression de vos données</h2>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Vous pouvez demander la suppression de toutes vos données personnelles de plusieurs façons :
            </p>
            <ol className="list-decimal space-y-4 pl-6 text-muted-foreground">
              <li>
                <strong className="text-foreground">Depuis notre application</strong> : Connectez-vous à votre compte,
                allez dans Paramètres et supprimez votre compte. Toutes vos données (conversations, comptes connectés)
                seront supprimées définitivement.
              </li>
              <li>
                <strong className="text-foreground">Depuis Facebook/Instagram</strong> : Si vous avez connecté vos
                comptes Meta, vous pouvez révoquer l&apos;accès et demander la suppression en allant sur{" "}
                <a
                  href="https://www.facebook.com/settings?tab=applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Paramètres Facebook → Applications et sites web
                </a>
                , puis en supprimant notre application. Une demande de suppression sera automatiquement envoyée.
              </li>
              <li>
                <strong className="text-foreground">Par contact</strong> : Envoyez-nous un email à l&apos;adresse
                indiquée dans les paramètres de votre compte pour demander la suppression manuelle de vos données.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Données concernées</h2>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              La suppression inclut : votre compte utilisateur, vos conversations (SMS, WhatsApp, Messenger,
              Instagram), les comptes Meta et Twilio connectés, et toute donnée personnelle associée.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Délai de traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous engageons à traiter votre demande dans un délai de 30 jours maximum, conformément aux
              exigences de Meta et au RGPD.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Suivi de votre demande</h2>
            <p className="text-muted-foreground leading-relaxed">
              Après avoir soumis une demande via Facebook, vous recevrez un code de confirmation. Vous pouvez
              vérifier le statut de votre demande sur cette page en utilisant ce code.
            </p>
          </section>
        </div>

        <div className="mt-12 space-y-4 pt-8 border-t">
          <Link
            href="/privacy-policy"
            className="block text-sm text-primary underline-offset-4 hover:underline"
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/terms-of-service"
            className="block text-sm text-primary underline-offset-4 hover:underline"
          >
            Conditions d&apos;utilisation
          </Link>
        </div>
      </div>
    </div>
  )
}
