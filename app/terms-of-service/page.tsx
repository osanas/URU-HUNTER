import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation - Facebook, Instagram, Twilio, WhatsApp",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="mb-2 text-3xl font-bold">Conditions d&apos;utilisation</h1>
        <p className="mb-12 text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">1. Acceptation des conditions</h2>
            <p className="text-muted-foreground leading-relaxed">
              En utilisant notre service de messagerie multicanale (Facebook Messenger, Instagram, SMS via
              Twilio, WhatsApp), vous acceptez les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas
              ces conditions, veuillez ne pas utiliser le service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">2. Description du service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Notre plateforme permet de centraliser et gérer vos conversations provenant de plusieurs canaux :
              Facebook Messenger, Instagram Direct, SMS et WhatsApp. Ces services sont fournis via des
              intégrations avec Meta (Facebook/Instagram) et Twilio.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">3. Comptes et connexions</h2>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Pour utiliser les fonctionnalités de messagerie, vous devez :
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Créer un compte et fournir des informations exactes</li>
              <li>Connecter vos Pages Facebook et comptes Instagram via l&apos;autorisation Meta</li>
              <li>Configurer Twilio pour les communications SMS et WhatsApp</li>
              <li>Respecter les conditions d&apos;utilisation de Meta et Twilio</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">4. Utilisation acceptable</h2>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Vous vous engagez à ne pas utiliser le service pour :
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Envoyer du spam ou des messages non sollicités</li>
              <li>Violer les politiques de Meta (Facebook, Instagram) ou Twilio</li>
              <li>Contourner les règles de WhatsApp Business</li>
              <li>Collecter des données sans consentement</li>
              <li>Toute activité illégale ou frauduleuse</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">5. Services tiers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Notre service s&apos;appuie sur des plateformes tierces. Votre utilisation est également soumise aux
              conditions de ces services :{' '}
              <a
                href="https://www.facebook.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Conditions Meta
              </a>
              ,{' '}
              <a
                href="https://www.twilio.com/legal/tos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Conditions Twilio
              </a>
              , et les politiques WhatsApp Business.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">6. Limitation de responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le service est fourni « tel quel ». Nous ne sommes pas responsables des interruptions,
              des pertes de données ou des problèmes liés aux services Meta ou Twilio. Les coûts des
              communications (SMS, WhatsApp) sont facturés par Twilio selon leurs tarifs.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">7. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions. Les utilisateurs seront informés des
              changements significatifs. La poursuite de l&apos;utilisation du service après modification constitue
              une acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant ces conditions, contactez-nous via les paramètres de votre compte.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            href="/privacy-policy"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Voir la Politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  )
}
